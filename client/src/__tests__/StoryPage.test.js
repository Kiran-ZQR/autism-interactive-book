"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("@testing-library/react");
var StoryPage_1 = require("../components/StoryPage");
//      ^ 从 __tests__ 回到 src，再到 components
var dummyPage = {
    id: 1,
    content: '这是测试页面',
    imagePath: '/page1.png',
    isInteractive: true,
    interactiveQuestion: '你好吗？',
    guidancePrompt: '提示'
};
it('renders interactive question title', function () {
    (0, react_1.render)(<StoryPage_1.StoryPage page={dummyPage} userResponses={[]} onNext={function () { }} onResponseSubmit={function () { }}/>);
    // 断言交互标题出现
    expect(react_1.screen.getByText('交互问题：')).toBeInTheDocument();
});
