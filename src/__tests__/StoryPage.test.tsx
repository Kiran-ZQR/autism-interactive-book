import { render, screen } from '@testing-library/react';
import { StoryPage } from '../components/StoryPage';
//      ^ 从 __tests__ 回到 src，再到 components

const dummyPage = {
  id: 1,
  content: '这是测试页面',
  imagePath: '/page1.png',
  isInteractive: true,
  interactiveQuestion: '你好吗？',
  guidancePrompt: '提示'
} as const;

it('renders interactive question title', () => {
  render(
    <StoryPage
      page={dummyPage as any}
      userResponses={[]}
      onNext={() => {}}
      onResponseSubmit={() => {}}
    />
  );
  // 断言交互标题出现
  expect(screen.getByText('交互问题：')).toBeInTheDocument();
});
