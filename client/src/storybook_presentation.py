import os
import time
from PIL import Image
import matplotlib.pyplot as plt
import matplotlib.image as mpimg

class InteractiveStorybook:
    def __init__(self, story_path, illustrations_dir):
        self.story_path = story_path
        self.illustrations_dir = illustrations_dir
        self.story_content = self._load_story()
        self.pages = self._parse_story()
        self.current_page = 0
        self.interactive_pages = [4, 8, 11]  # Pages with interactive content
        self.user_responses = {}
        self.response_timeout = 30  # seconds
        
    def _load_story(self):
        with open(self.story_path, 'r') as file:
            return file.read()
    
    def _parse_story(self):
        pages = []
        current_page = ""
        page_number = 0
        
        for line in self.story_content.split('\n'):
            if line.startswith('## '):
                if current_page:
                    pages.append((page_number, current_page.strip()))
                # 处理中文页码格式，如"第1页"
                page_text = line.split(' ')[1]
                if '第' in page_text and '页' in page_text:
                    # 提取"第X页"中的X
                    page_number = int(page_text.replace('第', '').replace('页', ''))
                else:
                    # 尝试直接解析数字
                    try:
                        page_number = int(page_text.split('页')[0])
                    except ValueError:
                        # 如果解析失败，使用顺序页码
                        page_number = len(pages) + 1
                
                current_page = line + '\n'
            else:
                current_page += line + '\n'
        
        # Add the last page
        if current_page:
            pages.append((page_number, current_page.strip()))
            
        return pages
    
    def display_page(self, page_number):
        """Display the content and illustration for a specific page"""
        for num, content in self.pages:
            if num == page_number:
                print(f"\n{content}\n")
                
                # Display illustration if it exists
                if page_number not in self.interactive_pages:
                    illustration_path = os.path.join(self.illustrations_dir, f"page{page_number}.png")
                    if os.path.exists(illustration_path):
                        img = Image.open(illustration_path)
                        plt.figure(figsize=(10, 8))
                        plt.imshow(img)
                        plt.axis('off')
                        plt.show()
                return True
        return False
    
    def is_interactive_page(self, page_number):
        """Check if the current page is an interactive page"""
        return page_number in self.interactive_pages
    
    def get_interactive_question(self, page_number):
        """Extract the interactive question from the page content"""
        for num, content in self.pages:
            if num == page_number:
                lines = content.split('\n')
                question_start = False
                question = []
                
                for line in lines:
                    if line.startswith('**交互问题：**'):
                        question_start = True
                    elif question_start and line.strip():
                        question.append(line)
                        
                return '\n'.join(question)
        return ""
    
    def provide_guidance(self, page_number):
        """Provide guidance if user doesn't respond within timeout"""
        guidance = {
            4: "让我来帮你思考一下。如果你是波波，你可能会说'你好'，或者'我叫波波'。你也可以问小兔子的名字，或者告诉她你喜欢她的歌声。你想对小兔子说什么呢？",
            8: "让我来帮你思考一下。波波可以先和他认识的莉莉打招呼，因为她已经是他的朋友了。或者，他可以去和看起来友善的乌龟说话，因为乌龟说话慢，可能不会让波波感到压力。你觉得波波应该怎么做呢？",
            11: "让我来帮你思考一下。友谊让波波变得更勇敢、更快乐了。你有没有和朋友一起解决过问题？比如一起完成作业，一起整理玩具，或者一起想办法帮助别人？请告诉我你的经历。"
        }
        return guidance.get(page_number, "请告诉我你的想法。")
    
    def read_non_interactive_content(self):
        """Read all non-interactive pages of the story"""
        for page_number, _ in self.pages:
            if page_number not in self.interactive_pages:
                self.display_page(page_number)
                input("按回车键继续...")
            else:
                print(f"\n到达交互页面 {page_number}，需要用户参与...\n")
                break
                
    def start_story(self):
        """Begin reading the story from the first page"""
        print("\n===== 开始阅读《小熊波波的友谊冒险》=====\n")
        self.read_non_interactive_content()
        
    def handle_interactive_page(self, page_number):
        """Handle an interactive page, asking questions and waiting for response"""
        self.display_page(page_number)
        question = self.get_interactive_question(page_number)
        print(f"\n{question}\n")
        
        # Wait for user response with timeout
        start_time = time.time()
        response = input("请输入你的回答（30秒内）: ")
        elapsed_time = time.time() - start_time
        
        if not response and elapsed_time >= self.response_timeout:
            guidance = self.provide_guidance(page_number)
            print(f"\n{guidance}\n")
            response = input("请输入你的回答: ")
            
        self.user_responses[page_number] = response
        return response
        
    def continue_story_after_interaction(self, last_interactive_page):
        """Continue reading the story after an interactive page"""
        next_page_index = 0
        for i, (page_number, _) in enumerate(self.pages):
            if page_number == last_interactive_page:
                next_page_index = i + 1
                break
                
        if next_page_index < len(self.pages):
            for i in range(next_page_index, len(self.pages)):
                page_number, _ = self.pages[i]
                if page_number not in self.interactive_pages:
                    self.display_page(page_number)
                    input("按回车键继续...")
                else:
                    print(f"\n到达交互页面 {page_number}，需要用户参与...\n")
                    break
                    
    def analyze_performance(self):
        """Analyze user performance across four dimensions"""
        if not self.user_responses:
            return "未收集到足够的用户回答进行分析。"
            
        analysis = {
            "语言词汇量": 0,
            "思维逻辑": 0,
            "社会适应": 0,
            "情感识别": 0
        }
        
        # Simple analysis based on response length and keywords
        for page, response in self.user_responses.items():
            # 语言词汇量: based on response length and variety
            words = response.split()
            unique_words = set(words)
            analysis["语言词汇量"] += min(len(words) / 5, 5) + min(len(unique_words) / 3, 5)
            
            # 思维逻辑: based on causal words and structure
            logic_words = ["因为", "所以", "如果", "但是", "然后", "接着", "首先", "其次", "最后"]
            logic_count = sum(1 for word in logic_words if word in response)
            analysis["思维逻辑"] += min(logic_count * 2, 5)
            
            # 社会适应: based on social interaction words
            social_words = ["朋友", "一起", "帮助", "分享", "谢谢", "请", "对不起", "合作", "玩"]
            social_count = sum(1 for word in social_words if word in response)
            analysis["社会适应"] += min(social_count * 2, 5)
            
            # 情感识别: based on emotion words
            emotion_words = ["高兴", "难过", "害怕", "生气", "担心", "开心", "喜欢", "爱", "紧张", "兴奋"]
            emotion_count = sum(1 for word in emotion_words if word in response)
            analysis["情感识别"] += min(emotion_count * 2, 5)
        
        # Normalize scores
        for dimension in analysis:
            analysis[dimension] = min(round(analysis[dimension] / len(self.user_responses), 1), 5)
            
        return analysis
        
    def generate_report(self):
        """Generate a final report based on user performance"""
        analysis = self.analyze_performance()
        
        report = "# 自闭症儿童语言交互能力评估报告\n\n"
        report += "## 基本信息\n"
        report += "- 年龄段：6-8岁\n"
        report += "- 绘本主题：友谊\n"
        report += f"- 完成交互环节数量：{len(self.user_responses)}/3\n\n"
        
        report += "## 能力维度评估（满分5分）\n"
        for dimension, score in analysis.items():
            report += f"- {dimension}：{score}分\n"
        
        report += "\n## 详细分析\n"
        
        # Language vocabulary analysis
        report += "### 语言词汇量\n"
        if analysis["语言词汇量"] < 2:
            report += "词汇量较为有限，表达方式简单。建议通过更多的阅读和对话活动，扩展孩子的词汇库。\n\n"
        elif analysis["语言词汇量"] < 4:
            report += "具备基本的词汇表达能力，能够使用简单句型进行交流。建议鼓励使用更丰富的形容词和动词。\n\n"
        else:
            report += "词汇量丰富，能够使用多样化的词汇进行表达。建议继续通过阅读拓展专业领域词汇。\n\n"
        
        # Logical thinking analysis
        report += "### 思维逻辑\n"
        if analysis["思维逻辑"] < 2:
            report += "逻辑表达能力需要加强，因果关系理解有限。建议通过简单的推理游戏培养逻辑思维能力。\n\n"
        elif analysis["思维逻辑"] < 4:
            report += "能够理解基本的因果关系，表达有一定的逻辑性。建议通过更复杂的问题解决活动提升逻辑思维。\n\n"
        else:
            report += "逻辑思维能力较强，能够清晰地表达因果关系和推理过程。建议尝试更复杂的逻辑推理活动。\n\n"
        
        # Social adaptation analysis
        report += "### 社会适应\n"
        if analysis["社会适应"] < 2:
            report += "社交互动意识较弱，对社交规则理解有限。建议通过角色扮演游戏培养基本社交技能。\n\n"
        elif analysis["社会适应"] < 4:
            report += "具备基本的社交意识，能够理解简单的社交规则。建议增加小组活动，提升社交互动能力。\n\n"
        else:
            report += "社交适应能力良好，能够理解并应用社交规则。建议参与更多团体活动，进一步提升社交能力。\n\n"
        
        # Emotional recognition analysis
        report += "### 情感识别\n"
        if analysis["情感识别"] < 2:
            report += "情感识别和表达能力有限，难以准确表达自身情感。建议通过情绪卡片游戏增强情感识别能力。\n\n"
        elif analysis["情感识别"] < 4:
            report += "能够识别基本情绪，有一定的情感表达能力。建议通过讨论故事人物情感，提升情感理解深度。\n\n"
        else:
            report += "情感识别能力较强，能够准确表达和理解多种情绪。建议探索更复杂的情感状态和共情能力培养。\n\n"
        
        report += "## 总结建议\n"
        avg_score = sum(analysis.values()) / len(analysis)
        if avg_score < 2:
            report += "建议增加日常交流互动，使用简单明确的语言，配合视觉提示辅助理解。可以通过结构化的社交故事和游戏，逐步提升语言表达和社交能力。\n"
        elif avg_score < 4:
            report += "孩子具备基本的交流能力，建议通过更多的小组活动和角色扮演，提升社交互动质量。同时，可以引导孩子表达更复杂的情感和想法，培养共情能力。\n"
        else:
            report += "孩子在语言交流方面表现良好，建议提供更具挑战性的社交情境，如解决冲突、协商合作等，进一步提升高阶社交能力和情感表达深度。\n"
        
        return report

# Main execution function
def run_storybook_presentation():
    story_path = "/home/ubuntu/interactive_storybook/story.md"
    illustrations_dir = "/home/ubuntu/interactive_storybook/illustrations"
    
    storybook = InteractiveStorybook(story_path, illustrations_dir)
    storybook.start_story()
    
    # This is a simulation - in a real application, this would be part of an interactive session
    print("\n===== 模拟交互环节 =====\n")
    print("注意：这是一个演示版本，实际应用中会等待真实用户的语音输入。")
    
    # For demonstration purposes only
    for page in storybook.interactive_pages:
        print(f"\n===== 交互页面 {page} =====\n")
        storybook.handle_interactive_page(page)
        storybook.continue_story_after_interaction(page)
    
    # Generate and save report
    report = storybook.generate_report()
    report_path = "/home/ubuntu/interactive_storybook/performance_report.md"
    with open(report_path, 'w') as f:
        f.write(report)
    
    print(f"\n===== 评估报告已生成：{report_path} =====\n")
    
if __name__ == "__main__":
    run_storybook_presentation()
