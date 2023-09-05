import { Layout } from '../../Layout';
import { argTypes, getDefaultArgs } from '../utils/argTypes';
import { Container } from '@pixi/display';
import { toolTip } from '../components/ToolTip';
import { preloadAssets } from '../utils/helpers';
import { ModeSwitcher } from './components/ModeSwitcher';
import { NineSlicePlane } from '@pixi/mesh-extras';
import { Texture } from '@pixi/core';

const args = {

};

const testAssets = {
    SliderBG: 'Progress/SliderBG.png',
};

class LayoutStory
{
    private layout: Layout;
    private toolTip: Layout;
    view = new Container();
    w: number;
    h: number;

    constructor(props: typeof args)
    {
        preloadAssets(Object.values(testAssets)).then(() => this.createLayout(props));
    }

    createLayout(props: typeof args)
    {
        const modeSwitcher = new ModeSwitcher();

        const background = new NineSlicePlane(
            Texture.from(testAssets.SliderBG),
            27,
            17,
            19,
            27,
        );

        this.layout = new Layout({
            content: {
                leftBlock: {
                    content: {
                        content: 'Content',
                        styles: {
                            position: 'center',
                            color: 'white',
                        },
                    },
                    styles: {
                        background: 'black',

                        landscape: {
                            position: 'left',
                            width: '73%',
                            height: '100%',
                        },
                        portrait: {
                            position: 'top',
                            width: '100%',
                            height: '56%',
                        },
                    },
                },
                rightBlock: {
                    content: {
                        innerContent: {
                            content: {
                                modeSwitcher,
                                blockWithBorder: {
                                    content: {
                                        title: {
                                            content: 'Title',
                                            styles: {
                                                fontFamily: 'BlenderPro',
                                                fontSize: 12,
                                                color: 0xa8ffef,
                                                landscape: {
                                                    display: 'block',
                                                    marginTop: 0,
                                                    marginLeft: 0,
                                                },
                                                portrait: {
                                                    display: 'inline',
                                                    marginTop: 17,
                                                    marginLeft: 20,
                                                },
                                            },
                                        },
                                        innerContent: {
                                            content: ' ',
                                            styles: {
                                                background,
                                                width: '100%',
                                                height: '100%',
                                                landscape: {
                                                    marginLeft: 0,
                                                },
                                                portrait: {
                                                    marginLeft: 20,
                                                },
                                            },
                                        },
                                    },
                                    styles: {
                                        width: '100%',
                                        height: '100%',
                                    },
                                },
                            },
                            styles: {
                                width: '100%',
                                height: '100%',
                            },
                        }
                    },
                    styles: {
                        background: 0x12081c,
                        landscape: {
                            position: 'right',
                            width: '28%',
                            height: '100%',
                        },
                        portrait: {
                            position: 'bottom',
                            width: '100%',
                            height: '45%',
                        },
                    },
                },
            },
            styles: {
                position: 'center',
                maxWidth: '100%',
                maxHeight: '100%',
                width: '100%',
                height: '100%',
            },
        });

        this.resize(this.w, this.h);
        this.view.addChild(this.layout);
    }

    async addTooltip(text: string)
    {
        this.toolTip = await toolTip(text);
        this.view.addChild(this.toolTip);
        this.toolTip.resize(this.w, this.h);
    }

    resize(w: number, h: number)
    {
        this.w = w;
        this.h = h;

        this.layout?.resize(w, h);
        this.toolTip?.resize(w, h);
    }
}

export const SidePanel = (params: any) => new LayoutStory(params);

export default {
    title: 'Complex',
    argTypes: argTypes(args),
    args: getDefaultArgs(args),
};