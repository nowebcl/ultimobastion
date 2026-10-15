import PocketBase from 'pocketbase'

const pb = new PocketBase('https://bd.maullinultimobastion.cl')

async function verify() {
  await pb.collection('_superusers').authWithPassword('maullinbastion@admin.cl', 'Maullin#2026!Bastion')

  const wpRemaining = await pb.collection('noticias').getList(1, 10, {
    filter: 'content ~ "wp-content/uploads"'
  })
  console.log('Posts con links restantes a wp-content/uploads:', wpRemaining.totalItems)

  const sample = await pb.collection('noticias').getList(1, 3, {
    filter: 'content ~ "bd.maullinultimobastion.cl"'
  })
  console.log('Posts con links a bd.maullinultimobastion.cl:', sample.totalItems)

  if (sample.items.length > 0) {
    const post = sample.items[0]
    const pbUrls = post.content.match(/https:\/\/bd\.maullinultimobastion\.cl\/api\/files\/[^\s"'>]+/g) || []
    console.log('Sample post title:', post.title)
    console.log('PocketBase Images found in post:', pbUrls.length)
    console.log('First 3 PocketBase image URLs:', pbUrls.slice(0, 3))
    
    // Check HTTP status of first image
    if (pbUrls.length > 0) {
      const imgRes = await fetch(pbUrls[0])
      console.log('HTTP Status of image 1 in PocketBase:', imgRes.status, imgRes.headers.get('content-type'))
    }
  }
}

verify().catch(console.error)
