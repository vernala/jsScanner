declare namespace jsscanner {

    function videoCancel(): void;

    function videoScanner(): Promise<string | null>;

    function imageScanner(): Promise<string | null>;

    function getImageQrData(): Promise<string | null>;
}

export = jsscanner
