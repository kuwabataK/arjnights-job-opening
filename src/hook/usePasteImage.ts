import { useEffect } from "react"

type Arg = {
    callback: (imageFile: File) => Promise<void>
}

export default function usePasteImage({ callback }: Arg) {

    useEffect(() => {
        const handlePaste = async (e: ClipboardEvent) => {
            if (e.clipboardData?.files.length) {
                const file = e.clipboardData.files[0]
                if (file.type.includes('image')) {
                    await callback(file)
                }
            }
        }
        document.addEventListener('paste', handlePaste)
        return () => {
            document.removeEventListener('paste', handlePaste)
        }
    }, [])

    const loadClipBoardImage = async () => {
        try {
            const clipboardItems = await navigator.clipboard.read();
            for (const type of clipboardItems[0].types) {
                if (type === 'image/png') {
                    const blob = await clipboardItems[0].getType(type);
                    const file = new File([blob], 'clipboard.png', { type: blob.type });
                    await callback(file)
                }
            }

        } catch (error) {
            console.error('Failed to read clipboard contents: ', error);
        }
    }

    return {
        loadClipBoardImage
    }

}