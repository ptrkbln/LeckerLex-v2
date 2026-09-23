// Cloudinary requires image's public_id (not the URL) to delete it
// public_id (<folder/public_id>) comes from
// url: https://res.cloudinary.com/<cloud_name>/image/upload/<version>/folder/<public_id>.<format>
export function extractImagePublicId(imageUrl) {
  if (!imageUrl) return null;
  const imageUrlParts = imageUrl.split("/upload/").at(-1).split("/");
  if (imageUrlParts.length <= 1) return null;
  imageUrlParts.shift(); // remove the <version>
  return imageUrlParts.join("/").split(".")[0];
}
