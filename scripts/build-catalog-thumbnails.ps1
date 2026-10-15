param(
  [int]$MaxWidth = 720,
  [int]$JpegQuality = 78
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$config = Get-Content (Join-Path $projectRoot 'site-config.js') -Raw
$baseUrl = [regex]::Match($config, "supabaseUrl: '([^']+)'").Groups[1].Value
$publicKey = [regex]::Match($config, "supabasePublishableKey: '([^']+)'").Groups[1].Value
if (-not $baseUrl -or -not $publicKey) { throw 'No se pudo leer la configuración pública de Supabase.' }

$headers = @{ apikey = $publicKey; Authorization = "Bearer $publicKey" }
$allImages = @()
foreach ($table in @('product_images', 'package_images')) {
  $rows = Invoke-RestMethod -Uri "$baseUrl/rest/v1/$table`?select=storage_path,position&order=position.asc" -Headers $headers
  $allImages += $rows
}
$paths = @($allImages | ForEach-Object { $_.storage_path } | Where-Object { $_ } | Sort-Object -Unique)
$thumbDir = Join-Path $projectRoot 'assets\catalog-thumbs'
New-Item -ItemType Directory -Path $thumbDir -Force | Out-Null

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq 'image/jpeg' } | Select-Object -First 1
$qualityEncoder = [System.Drawing.Imaging.Encoder]::Quality
$parameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
$parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($qualityEncoder, [long]$JpegQuality)
$manifest = [ordered]@{}

foreach ($batchStart in 0..([math]::Ceiling($paths.Count / 40) - 1)) {
  $batch = @($paths | Select-Object -Skip ($batchStart * 40) -First 40)
  $body = @{ expiresIn = 3600; paths = $batch } | ConvertTo-Json -Depth 4
  $signed = Invoke-RestMethod -Method Post -Uri "$baseUrl/storage/v1/object/sign/product-images" -Headers $headers -ContentType 'application/json' -Body $body
  foreach ($entry in $signed) {
    if ($entry.error) { Write-Warning "No se pudo firmar $($entry.path): $($entry.error)"; continue }
    $path = $entry.path
    $signedPath = if ($entry.signedURL) { $entry.signedURL } else { $entry.signedUrl }
    if (-not $path -or -not $signedPath) { continue }
    $name = [System.IO.Path]::GetFileNameWithoutExtension($path) + '.jpg'
    $destination = Join-Path $thumbDir $name
    if (-not (Test-Path $destination)) {
      $tempPath = Join-Path ([System.IO.Path]::GetTempPath()) ([guid]::NewGuid().ToString() + '.image')
      try {
        Invoke-WebRequest -Uri "$baseUrl/storage/v1$signedPath" -OutFile $tempPath
        $source = [System.Drawing.Image]::FromFile($tempPath)
        try {
          $width = [math]::Min($MaxWidth, $source.Width)
          $height = [math]::Max(1, [math]::Round($source.Height * $width / $source.Width))
          $thumb = New-Object System.Drawing.Bitmap([int]$width, [int]$height)
          try {
            $drawing = [System.Drawing.Graphics]::FromImage($thumb)
            try {
              $drawing.Clear([System.Drawing.Color]::FromArgb(18, 15, 16))
              $drawing.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
              $drawing.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
              $drawing.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
              $drawing.DrawImage($source, 0, 0, $width, $height)
            } finally { $drawing.Dispose() }
            $thumb.Save($destination, $jpegCodec, $parameters)
          } finally { $thumb.Dispose() }
        } finally { $source.Dispose() }
      } finally { Remove-Item -LiteralPath $tempPath -ErrorAction SilentlyContinue }
    }
    $manifest[$path] = "assets/catalog-thumbs/$name"
  }
}

$json = ConvertTo-Json -InputObject $manifest -Depth 4 -Compress
$manifestFile = Join-Path $thumbDir 'manifest.js'
[System.IO.File]::WriteAllText($manifestFile, "window.ARTE_QUE_NACE_THUMBNAILS = Object.freeze($json);`n", [System.Text.UTF8Encoding]::new($false))
$size = (Get-ChildItem $thumbDir -Filter '*.jpg' | Measure-Object -Property Length -Sum).Sum
Write-Host "Miniaturas: $($manifest.Count); peso total: $([math]::Round($size / 1MB, 2)) MB"
