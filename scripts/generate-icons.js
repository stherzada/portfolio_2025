import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [
    { width: 16, height: 16, name: 'favicon-16x16.png' },
    { width: 32, height: 32, name: 'favicon-32x32.png' },
    { width: 180, height: 180, name: 'apple-touch-icon.png' },
    { width: 192, height: 192, name: 'android-chrome-192x192.png' },
    { width: 512, height: 512, name: 'android-chrome-512x512.png' }
];

const sourceImage = join(__dirname, '../public/logo.png');
const publicDir = join(__dirname, '../public');

async function generateIcons() {
    try {
        // Criar favicon.ico (combinação de 16x16 e 32x32)
        const favicon16Buffer = await sharp(sourceImage)
            .resize(16, 16)
            .toBuffer();

        const favicon32Buffer = await sharp(sourceImage)
            .resize(32, 32)
            .toBuffer();

        await sharp(favicon16Buffer)
            .toFile(join(publicDir, 'favicon.ico'));

        // Gerar outros ícones
        for (const size of sizes) {
            await sharp(sourceImage)
                .resize(size.width, size.height)
                .toFile(join(publicDir, size.name));

            console.log(`✓ Gerado ${size.name}`);
        }

        console.log('✨ Todos os ícones foram gerados com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao gerar ícones:', error);
        process.exit(1);
    }
}

generateIcons(); 