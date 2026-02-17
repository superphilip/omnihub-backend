type TranslationConfig = {
    provider: 'mock' | 'google';
    googleApiKey?: string;
};

export class TranslationService {
    private config: TranslationConfig;

    constructor(config: TranslationConfig) {
        this.config = config;
    }

    async translate(text: string, to: string, from: string = 'es'): Promise<string> {
        if (this.config.provider === 'mock') {
            return `[${to}] ${text}`; // mock tipo dev
        }
        if (this.config.provider === 'google' && this.config.googleApiKey) {
            return await this.googleTranslate(text, to, from);
        }
        throw new Error('No translation provider configured.');
    }

    private async googleTranslate(text: string, to: string, from: string) {
        const res = await fetch(
            `https://translation.googleapis.com/language/translate/v2?key=${this.config.googleApiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    q: text,
                    source: from,
                    target: to,
                    format: 'text'
                })
            }
        );
        const json = await res.json() as {
            data?: { translations?: Array<{ translatedText: string }> };
        };
        if (!json.data || !json.data.translations || !json.data.translations[0]) {
            throw new Error('Google Translate API failed');
        }
        return json.data.translations[0].translatedText;
    }
}