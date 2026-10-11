import { getSupabase, signedImageUrl } from './supabase-client.js?v=catalog-live-2';

export async function loadCatalog() {
  const client = getSupabase();
  const [categoriesResult, productsResult, packagesResult] = await Promise.all([
    client.from('categories').select('id,parent_id,name,slug,description,position').order('position'),
    client.from('products').select('id,category_id,title,slug,summary,description,status,position').order('position').order('id'),
    client.from('packages').select('id,category_id,title,slug,summary,description,status,position').order('position').order('id'),
  ]);
  if (categoriesResult.error) throw categoriesResult.error;
  if (productsResult.error) throw productsResult.error;
  if (packagesResult.error) throw packagesResult.error;

  const products = productsResult.data || [];
  const packages = packagesResult.data || [];
  if (!products.length && !packages.length) return { categories: categoriesResult.data || [], products, packages };

  const [productImagesResult, packageImagesResult] = await Promise.all([
    products.length ? client.from('product_images').select('product_id,storage_path,alt_text,position')
      .in('product_id', products.map((product) => product.id)).order('position')
      : Promise.resolve({ data: [] }),
    packages.length ? client.from('package_images').select('package_id,storage_path,alt_text,position')
      .in('package_id', packages.map((pack) => pack.id)).order('position')
      : Promise.resolve({ data: [] }),
  ]);
  if (productImagesResult.error) throw productImagesResult.error;
  if (packageImagesResult.error) throw packageImagesResult.error;

  const firstImageByProduct = new Map();
  for (const image of productImagesResult.data || []) {
    if (!firstImageByProduct.has(image.product_id)) firstImageByProduct.set(image.product_id, image);
  }
  const firstImageByPackage = new Map();
  for (const image of packageImagesResult.data || []) {
    if (!firstImageByPackage.has(image.package_id)) firstImageByPackage.set(image.package_id, image);
  }
  await Promise.all(products.map(async (product) => {
    const image = firstImageByProduct.get(product.id);
    if (!image) return;
    product.image_alt = image.alt_text;
    product.image_url = await signedImageUrl(image.storage_path);
  }));
  await Promise.all(packages.map(async (pack) => {
    const image = firstImageByPackage.get(pack.id);
    if (!image) return;
    pack.image_alt = image.alt_text;
    pack.image_url = await signedImageUrl(image.storage_path);
  }));
  return { categories: categoriesResult.data || [], products, packages };
}

export async function loadProduct(slug) {
  const client = getSupabase();
  const { data: product, error } = await client.from('products')
    .select('id,category_id,title,slug,summary,description,status,position')
    .eq('slug', slug).maybeSingle();
  if (error) throw error;
  if (!product) return null;

  const { data: images, error: imageError } = await client.from('product_images')
    .select('storage_path,alt_text,position')
    .eq('product_id', product.id).order('position');
  if (imageError) throw imageError;
  product.images = await Promise.all((images || []).map(async (image) => ({
    url: await signedImageUrl(image.storage_path), alt: image.alt_text,
  })));
  return product;
}

export async function loadPackage(slug) {
  const client = getSupabase();
  const { data: pack, error } = await client.from('packages')
    .select('id,category_id,title,slug,summary,description,status,position')
    .eq('slug', slug).maybeSingle();
  if (error) throw error;
  if (!pack) return null;
  const [imagesResult, itemsResult] = await Promise.all([
    client.from('package_images').select('storage_path,alt_text,position')
      .eq('package_id', pack.id).order('position'),
    client.from('package_items').select('product_id,position,products(title,slug)')
      .eq('package_id', pack.id).order('position'),
  ]);
  if (imagesResult.error) throw imagesResult.error;
  if (itemsResult.error) throw itemsResult.error;
  pack.images = await Promise.all((imagesResult.data || []).map(async (image) => ({
    url: await signedImageUrl(image.storage_path), alt: image.alt_text,
  })));
  pack.items = (itemsResult.data || []).map((item) => ({
    title: item.products?.title || '', slug: item.products?.slug || '',
  }));
  return pack;
}
