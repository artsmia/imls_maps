export default function imageUrl(id) {
  return "http://"+id%7+".api.artsmia.org/"+id+".jpg"
}
