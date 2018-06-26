/** @format
 */
export default function imageUrl(id, crop = false) {
  return crop
    ? '/static/artwork-image-crops/' + id + '.jpg'
    : `https://iiif.dx.artsmia.org/${id}.jpg/full/0,800/0/default.jpg`
}
