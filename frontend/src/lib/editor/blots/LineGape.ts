import { Quill } from "react-quill";
import { EnumCustomBlots } from "../../enums";

// let BlockEmbed = Quill.import('blots/block/embed');
let Block = Quill.import('blots/block');
class PreviousBackground extends Block {
    static create(){
        let node = super.create();
        node.setAttribute('class', 'previous-background');
        return node;
    }
 }
PreviousBackground.blotName = EnumCustomBlots.PreviousBackground;
PreviousBackground.tagName = 'p';

Quill.register(PreviousBackground);


class CurrentBackground extends Block {
    static create(){
        let node = super.create();
        node.setAttribute('class', 'current-background');
        return node;
    }
 }
 CurrentBackground.blotName = EnumCustomBlots.CurrentBackground;
 CurrentBackground.tagName = 'p';

Quill.register(CurrentBackground);


class EmptyParagraph extends Block{
    static create(){
        let node = super.create();
        node.setAttribute('class', 'bg-success');
        return node;
    }
}

EmptyParagraph.blotName = EnumCustomBlots.EmptyParagraph;
EmptyParagraph.tagName = 'p';

Quill.register(EmptyParagraph);
