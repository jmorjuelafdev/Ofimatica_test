from PIL import Image
from pathlib import Path

base_dir = Path(__file__).parent
source = base_dir / 'src' / 'img' / 'icon-192.png'
target = base_dir / 'favicon.ico'

img = Image.open(source)
img.save(target, sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
print(f'Favicon generated at {target}')
