import PocketBase from 'pocketbase'

const pb = new PocketBase('https://bd.maullinultimobastion.cl')
pb.autoCancellation(false)

async function test() {
  await pb.collection('users').authWithPassword('maullinbastion@admin.cl', 'Maullin#2026!Bastion')

  // Search records matching 'olimpiada' or recent records
  const list = await pb.collection('noticias').getList(1, 10, {
    sort: '-id'
  })
  console.log('Total items in PB:', list.totalItems)
  list.items.forEach(i => {
    console.log({ id: i.id, slug: i.slug, title: i.title, date: i.date })
  })
}

test().catch(console.error)
