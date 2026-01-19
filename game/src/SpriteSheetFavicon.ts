interface SpriteSheetFaviconOptions {
    src: string; // Pfad zum Sprite Sheet
    frameCount?: number; // Anzahl der Frames
    frameWidth?: number; // Breite eines Frames
    interval?: number; // Frame-Dauer in ms
}

export default class SpriteSheetFavicon {
    private frames: string[] = [];
    private index = 0;
    private timer: number | null = null;
    private link: HTMLLinkElement | null;
    private image: HTMLImageElement;
    private frameCount: number;
    private frameWidth: number;
    private interval: number;

    constructor(
        {
            src,
            frameCount = 8,
            frameWidth = 32,
            interval = 300,
        }: SpriteSheetFaviconOptions,
        onReady?: () => void
    ) {
        this.frameCount = frameCount;
        this.frameWidth = frameWidth;
        this.interval = interval;

        this.link = document.getElementById(
            "favicon"
        ) as HTMLLinkElement | null;
        this.image = new Image();
        this.image.src = src;

        this.image.onload = () => {
            this.extractFrames();
            if (onReady) onReady();
        };
    }

    private extractFrames() {
        const targetSize = 32; // Zielgröße für das Favicon
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = targetSize;
        canvas.height = targetSize;

        for (let i = 0; i < this.frameCount; i++) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Skaliere den Frame auf 64x64
            ctx.drawImage(
                this.image,
                i * this.frameWidth,
                0,
                this.frameWidth,
                this.image.height,
                0,
                0,
                targetSize,
                targetSize
            );
            this.frames.push(canvas.toDataURL("image/png"));
        }
        // Setze das Favicon sofort auf den ersten Frame
        if (this.link && this.frames.length > 0) {
            this.link.href = this.frames[0];
        }
    }

    public start() {
        if (!this.frames.length || this.timer !== null) return;
        // Setze das Favicon sofort auf den aktuellen Frame
        if (this.link) {
            this.link.href = this.frames[this.index];
        }
        this.timer = window.setInterval(() => {
            if (this.link) {
                this.link.href = this.frames[this.index];
                this.index = (this.index + 1) % this.frames.length;
            }
        }, this.interval);
    }

    public stop(reset = true) {
        if (this.timer !== null) {
            clearInterval(this.timer);
            this.timer = null;
        }

        if (reset && this.frames.length && this.link) {
            this.link.href = this.frames[0];
            this.index = 0;
        }
    }
}

