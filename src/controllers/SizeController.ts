import { getNumber } from '../utils/helpers';
import { Layout } from '../Layout';
import { Text } from '@pixi/text';
import { Container } from '@pixi/display';
import { FlexNumber, SizeControl } from '../utils/types';

/** Size controller manages {@link Layout} and it's content size. */
export class SizeController
{
    private layout: Layout;
    private _width: number;
    private _height: number;

    parentWidth = 0;
    parentHeight = 0;

    /**
     * Creates size controller.
     * @param {Layout} layout - Layout to control.
     */
    constructor(layout: Layout)
    {
        this.layout = layout;
    }

    /**
     * Updates layout size and all children sizes
     * @param {number} parentWidth - Parent width
     * @param {number} parentHeight - Parent height
     */
    update(parentWidth: number, parentHeight: number)
    {
        let finalWidth = 0;
        let finalHeight = 0;

        this.parentWidth = parentWidth;
        this.parentHeight = parentHeight;

        const {
            width,
            height,
            maxWidth,
            maxHeight,
            scaleX,
            scaleY,
            background,
            paddingLeft,
            paddingRight,
            paddingTop,
            paddingBottom
        } = this.layout.style;

        if (width === 0 || height === 0)
        {
            this.layout.visible = false;

            return;
        }

        if (width === 'auto')
        {
            switch (this.sizeControlType)
            {
                case 'innerText':
                    // resize basing on text width
                    if (!this.innerText.style.wordWrap && this.innerText.width >= parentWidth - paddingLeft - paddingRight)
                    {
                        this.innerText.style.wordWrap = true;
                    }

                    if (this.innerText.style.wordWrap)
                    {
                        this.innerText.style.wordWrapWidth = parentWidth - paddingLeft - paddingRight;
                    }

                    // console.log(this.layout.id, {
                    //     width: child.width,
                    //     maxWidthVal,
                    //     wordWrap: child.style.wordWrap,
                    //     textAndPaddingsWidth,
                    //     wordWrapWidth: child.style.wordWrapWidth
                    // });

                    finalWidth = this.innerText.width + paddingRight + paddingLeft;

                    break;

                case 'stickToBackground':
                    // resize basing on background width
                    finalWidth = (background as Container).width;

                    break;

                case 'fitToParent':
                default:
                    // resize to parent width
                    finalWidth = parentWidth;

                    break;
            }
        }
        else
        {
            finalWidth = getNumber(width, parentWidth);
        }

        if (height === 'auto')
        {
            switch (this.sizeControlType)
            {
                case 'innerText':
                    finalHeight = this.innerText?.height + paddingBottom + paddingTop;

                    break;

                case 'stickToBackground':
                    // height is basing on background height
                    finalHeight = (background as Container).height;

                    break;

                default:
                    break;
            }
        }
        else
        {
            finalHeight = getNumber(height, parentHeight);
        }

        if (this.layout.parent instanceof Layout)
        {
            const parentPadding = this.layout.parent?.style.padding ?? 0;

            finalWidth -= parentPadding;
            finalHeight -= parentPadding;
        }

        if (finalWidth < 0) finalWidth = 0;
        if (finalHeight < 0) finalHeight = 0;

        if (finalWidth === 0 || finalHeight === 0)
        {
            this.layout.visible = false;

            return;
        }

        this._width = getNumber(finalWidth, this.parentWidth);
        this._height = getNumber(finalHeight, this.parentHeight);

        this.layout.scale.set(scaleX, scaleY);

        if (maxWidth || maxHeight)
        {
            this.fitToSize(parentWidth, parentHeight);
        }

        this.layout.updateBG();
        this.layout.updateMask();

        this.layout.align.update(this.parentWidth, this.parentHeight);
    }

    /** Get type of width control basing on styles and in case if width of the layout is set to `auto`. */
    private get sizeControlType(): SizeControl
    {
        const { display, background } = this.layout.style;

        if (this.isItJustAText)
        {
            return 'innerText';
        }

        if (display !== 'block' && background instanceof Container)
        {
            return 'stickToBackground';
        }

        return 'fitToParent';
    }

    /** Detect if layout is just a wrapper for a text element.  */
    private get isItJustAText(): boolean
    {
        const hasOnly1Child = this.layout.content.children.length === 1;

        return hasOnly1Child && this.layout.content.children[0] instanceof Text;
    }

    /** Get first child of the layout */
    get innerText(): Text
    {
        if (!this.isItJustAText)
        {
            return null;
        }

        return this.layout.content.children[0] as Text;
    }

    /** Get width of the controlled layout. */
    get width(): number
    {
        return this._width;
    }

    /**
     * Set width of the controlled layout. And align children.
     * @param {FlexNumber} width - Width to set.
     */
    set width(width: FlexNumber)
    {
        this._width = getNumber(width, this.parentWidth);
        this.layout.align.update(this.parentWidth, this.parentHeight);
    }

    /** Get height of the controlled layout. */
    get height(): number
    {
        return this._height;
    }

    /**
     * Set height of the controlled layout. And align children.
     * @param {FlexNumber} height - Height to set.
     */
    set height(height: FlexNumber)
    {
        this._height = getNumber(height, this.parentHeight);
        this.layout.align.update(this.parentWidth, this.parentHeight);
    }

    /**
     * Fits controlled layout into parent size, scales it down if does not fit.
     *
     * This method is called when maxWidth or maxHeight is set.
     * @param parentWidth
     * @param parentHeight
     */
    private fitToSize(parentWidth: number, parentHeight: number)
    {
        const { maxWidth, maxHeight, marginLeft, marginRight, marginBottom, marginTop } = this.layout.style;

        const currentScaleX = this.layout.scale.x;
        const currentScaleY = this.layout.scale.y;

        const layoutWidth = this.layout.width + marginLeft + marginRight;
        const layoutHeight = this.layout.height + marginTop + marginBottom;

        const maxWidthVal = getNumber(maxWidth, parentWidth);
        const maxHeightVal = getNumber(maxHeight, parentHeight);

        const fitScaleX = maxWidthVal / layoutWidth;
        const fitScaleY = maxHeightVal / layoutHeight;

        let finalScaleX = currentScaleX;
        let finalScaleY = currentScaleY;

        if (layoutWidth * currentScaleX > maxWidthVal)
        {
            finalScaleX = fitScaleX;
        }

        if (layoutHeight * currentScaleY > maxHeightVal)
        {
            finalScaleY = fitScaleY;
        }

        this.layout.scale.set(Math.min(finalScaleX, finalScaleY));
    }
}
