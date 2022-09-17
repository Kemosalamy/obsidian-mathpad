/* eslint-disable @typescript-eslint/ban-types */
import { debounce, finishRenderMath, ItemView, MarkdownView, Notice, View, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";

import { MathpadContainer } from "./MathpadContainer";


import { loadMathJax } from "obsidian";
import PadSlot from "src/Math/PadSlot";
import { MathpadSettings } from "src/MathpadSettings";
import { getMathpadSettings } from "src/main";
export const MATHPAD_VIEW = "mathpad-view";

export const MathpadContext = React.createContext<any>({});

function copyContent(view: View, content: string, block?: boolean) {

    if(block !==undefined){
        content = block ? `$$${content}$$`:`$${content}$`;   
    }

    // const mv: MarkdownView = view as MarkdownView;

    if(view instanceof MarkdownView && view.getMode()==="source"){
        view.editor.replaceSelection(content);
    } else {
        navigator.clipboard.writeText(content);
        new Notice("Content copied to clipboard");
    }
}

export class MathpadView extends ItemView {
    settings: MathpadSettings;
    root: Root;
    state = {

    };



    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
        // this.settings = (this.app as any).plugins.plugins["obsidian-mathpad"].settings as MathpadSettings;
        this.settings = getMathpadSettings();
        this.state = {

        };
        this.icon = "sigma";
        this.onCopySlot = this.onCopySlot.bind(this);
    }

    getViewType() {
        return MATHPAD_VIEW;
    }

    getDisplayText() {
        return "Mathpad";
    }

    override onResize(): void {
        super.onResize();
        this.handleResize();
    }

    handleResize = debounce(() => {
        this.render();
    }, 300);


    onCopySlot(slot: PadSlot, what: string) {
        const str = slot.getCodeBlock(this.settings);
        const leaf = this.app.workspace.getMostRecentLeaf();
        if (!leaf) return;
        // if (leaf.view instanceof MarkdownView) {
        //     const editor = leaf.view.editor;
        //     if (editor) {
                switch (what) {
                    case "input":
                            copyContent(leaf.view, slot.inputLaTeX, this.settings.preferBlock);
                            break;
                    case "result":
                        copyContent(leaf.view, slot.laTeX, this.settings.preferBlock);

                    break;
                    default:
                        copyContent(leaf.view, `\`\`\`mathpad
${str}
\`\`\`
`)
                        break;
                }


        //     }
        // } else {
        //     console.warn('Mathpad: Unable to determine current editor.');
        //     return;
        // }


    }

    render() {

        this.root.render(
            <React.StrictMode>
                <MathpadContext.Provider value={{
                    width: this.contentEl.innerWidth,
                    settings: this.settings
                }}>
                    <MathpadContainer  {...this.state} onCopySlot={this.onCopySlot}
                        settings={this.settings}
                    />
                </MathpadContext.Provider>
            </React.StrictMode>
        );
    }



    async onOpen() {
        const { contentEl } = this;
        // contentEl.setText('Woah!');
        // this.titleEl.setText("Obsidian Janitor")	

        this.root = createRoot(contentEl/*.children[1]*/);
        await loadMathJax();
        await finishRenderMath();
        this.render();
        // const e = nerdamer('x^2+2*(cos(x)+x*x)');
        // const latex = e.toTeX();
        // console.log(latex);
        // const mathEl = renderMath(latex, true);
        // contentEl.appendChild(mathEl);
    }

    async onClose() {

        this.root.unmount();
    }
}
