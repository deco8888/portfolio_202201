interface CaptionOptions {
    cursor: HTMLElement;
}

export default class Caption {
    elms: {
        cursor: HTMLElement;
        links: NodeListOf<HTMLElement>;
        images: NodeListOf<HTMLElement>;
    };
    constructor(props: Partial<CaptionOptions>) {
        this.elms = {
            cursor: props.cursor ? props.cursor : null,
            links: null,
            images: null,
        };
        this.init();
    }
    init(): void {
        this.handleEvent();
    }
    handleEvent(): void {}
    hover(): void {}
}
