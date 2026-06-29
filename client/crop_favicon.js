const Jimp = require('jimp');

async function cropImages() {
    try {
        const files = ['public/favicon.png', 'public/favicon.ico'];
        for (const file of files) {
            console.log(`Cropping ${file}...`);
            const image = await Jimp.read(file);
            
            // autocrop automatically removes empty transparent borders
            image.autocrop();
            
            await image.writeAsync(file);
            console.log(`${file} cropped successfully.`);
        }
    } catch (error) {
        console.error('Error processing image:', error);
    }
}

cropImages();
