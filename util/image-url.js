// return "http://"+id%7+".api.artsmia.org/"+id+".jpg"
export default function imageUrl(id, crop=false) {
  return crop ? "/static/artwork-image-crops/"+id+".jpg" : "http://"+id%7+".api.artsmia.org/"+id+".jpg"
}
