export let allThreads = require('./threads.json')
export let allObjects = require('./objects.json')
export let artworkMeta = require('./artworkMeta.json')

Object.keys(allThreads).map(key => {
  let thread = allThreads[key]
  allThreads[key].facts = thread.__content.split('\n').filter(fact => fact !== "")
  thread.title = thread.thread[0]
  // thread.artworkIds = []
  thread.artworks = []
})

export let activeThreads = [
  'buddhism',
  'silk-road',
  'red-dye-from-mexico',
  'blue-white',
  'asian-design-and-influence',
  'silver',
  'china-trade',
].map(t => allThreads[t]).filter(t => !!t)

export let objectIds = Object.keys(allObjects)

objectIds.map(key => {
  let object = allObjects[key]
  object.threads.map(threadName => {
    const fixedName = threadName.replace('&', 'and').replace('dye', 'Dye')
    var associatedThread = Object.values(allThreads).find(t => t.thread[0] == fixedName)

    if(associatedThread) {
      // associatedThread.artworkIds.push(object.id)
      associatedThread.artworks.push(object)
    } else { 
      console.error('Problem with thread names!!!')
    }
  })

  objectIds = objectIds.concat(object.relateds)

  allObjects[key].meta = artworkMeta
    .filter(art => art)
    .find(({id}) => id === key)
})

Object.values(allThreads).map(thread => {
  if(thread.order) {
    const threadOrder = thread.order.split(" ")
    thread.artworks = thread.artworks.sort((a, b) => {
      return a.sortDate - b.sortDate
    })
  }
})

