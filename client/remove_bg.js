const Jimp = require('jimp');

async function removeBackground() {
    try {
        const image = await Jimp.read('public/logo.png');
        
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];
            
            // Check if pixel is grayscale (r, g, b are very similar)
            const isGrayscale = Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20;
            
            // Check if pixel is light colored (white or light grey of the checkerboard)
            const isLight = r > 180;

            if (isGrayscale && isLight) {
                // Set alpha to 0 (transparent)
                this.bitmap.data[idx + 3] = 0;
            }
        });

        await image.writeAsync('public/logo.png');
        console.log('Background removed successfully.');
    } catch (error) {
        console.error('Error processing image:', error);
    }
}

removeBackground();
