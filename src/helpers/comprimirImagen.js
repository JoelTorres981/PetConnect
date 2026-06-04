// Comprime una imagen con Canvas a máximo 800x800px y calidad JPEG 0.75.
// Retorna un string base64 (data:image/jpeg;base64,...) listo para enviar al backend.
export const comprimirImagen = (file) =>
    new Promise((resolve, reject) => {
        const img = new Image()
        const url = URL.createObjectURL(file)
        img.onload = () => {
            const MAX = 800
            let { width, height } = img
            if (width > MAX || height > MAX) {
                if (width > height) {
                    height = Math.round((height * MAX) / width)
                    width = MAX
                } else {
                    width = Math.round((width * MAX) / height)
                    height = MAX
                }
            }
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            canvas.getContext('2d').drawImage(img, 0, 0, width, height)
            URL.revokeObjectURL(url)
            resolve(canvas.toDataURL('image/jpeg', 0.75))
        }
        img.onerror = reject
        img.src = url
    })
