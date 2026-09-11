import type {ProductVariantFragment} from 'storefrontapi.generated';
import {Image} from '@shopify/hydrogen';
import productFallbackImg from '~/assets/illustration-product-fallback.png';

export function ProductImage({
  image,
}: {
  image: ProductVariantFragment['image'];
}) {
  return (
    <div className="bg-tint-sand rounded-card aspect-square flex items-center justify-center overflow-hidden">
      {image ? (
        <Image
          alt={image.altText || 'Product Image'}
          aspectRatio="1/1"
          data={image}
          key={image.id}
          sizes="(min-width: 45em) 50vw, 100vw"
          className="w-full h-full object-cover"
        />
      ) : (
        <img
          src={productFallbackImg}
          alt="Illustrated Hindu temple book cover artwork"
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}
