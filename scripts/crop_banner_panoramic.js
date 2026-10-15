import sharp from 'sharp'

async function cropTest() {
  const meta = await sharp('public/Atardecer dramático sobre el muelle costero.png').metadata()
  console.log('Original dimensions:', meta.width, 'x', meta.height)

  // Test crop focused on bridge and boats:
  // Bridge and boats are in the lower portion of the image.
  // Let's crop from top: 340, height: 460, width: 1916
  await sharp('public/Atardecer dramático sobre el muelle costero.png')
    .extract({ left: 0, top: 340, width: 1916, height: 460 })
    .webp({ quality: 85 })
    .toFile('public/images/site/banner-panorama.webp')

  console.log('Cropped panoramic banner generated successfully: 1916 x 460 (~4.16:1 ratio)')
}

cropTest().catch(console.error)
