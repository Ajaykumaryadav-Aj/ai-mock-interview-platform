export default function MarqueImg({ img, alt }) {
  const defaultAlt = alt || img.split("/").pop().replace(/\.[^/.]+$/, "") + " logo";
  return (
    <img
      src={img}
      className="w-44 h-44 xl:w-52 xl:h-52 object-contain grayscale mx-12 xl:mx-16"
      alt={defaultAlt}
      loading="lazy"
    />
  );
}
