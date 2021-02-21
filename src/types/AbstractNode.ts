import { Uri } from 'vscode';
import { writeBaseModel } from '../util/common';
import { GeneratorContext } from './Context';
import { ParentItem, listenParentPath } from './ParentItem';

export abstract class AbstractNode {
    private readonly _parentElements: ParentItem[];
    private readonly _genDir: Uri;
    private readonly _baseItem: string;
    private readonly _id: number;
    private readonly _injectFolder: string;
    private _textureFileName: string;

    constructor(ctx: GeneratorContext) {
        this._parentElements = ctx.parentElements;
        this._genDir = ctx.genDir;
        this._baseItem = ctx.baseItem;
        this._injectFolder = ctx.injectFolder;
        this._id = ctx.id;
        this._textureFileName = ctx.textureFileName;
    }

    abstract childQuestion(parentElements: ParentItem[]): Promise<void>;

    async generate(): Promise<void> {
        const dir = this._makeUri('models', `${this._baseItem}.json`);
        await writeBaseModel(dir, this._baseItem, this._id, this._injectPath(this._id.toString()), this._parentElements);
    }

    protected async listenParentPath(parentElements: ParentItem[], withoutNonHasTextures?: boolean): Promise<string> {
        return await listenParentPath(parentElements, 'parent', withoutNonHasTextures);
    }

    protected getTexturePath(customFileName?: string): string {
        return `item/${this._getTextureFilePath(customFileName)}`;
    }

    protected getTextureUri(customFileName?: string): Uri {
        return this._makeUri('textures', `${this._getTextureFilePath(customFileName)}.png`);
    }

    protected getChildModelUri(): Uri {
        return this._makeUri('models', this._injectPath(`${this._id}.json`));
    }

    private _getTextureFilePath(customFileName?: string): string {
        const name = this._textureFileName
            .replace('{item}', this._baseItem)
            .replace('{custom_model_data}', `${this._id}`);
        return this._injectPath(customFileName ? `${name}/${customFileName}` : name);
    }

    private _injectPath(afterPath: string): string {
        return this._injectFolder ? `${this._injectFolder}/${afterPath}` : afterPath;
    }

    private _makeUri(category: string, ...itemAfter: string[]): Uri {
        return Uri.joinPath(this._genDir, 'assets/minecraft', category, 'item', ...itemAfter);
    }
}