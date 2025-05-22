"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 说明：
 * 1. 所有插图都放在 client/public/ 目录。
 * 2. 这里的 imagePath 必须写成以 “/” 开头的相对网址，
 *    例如 public/page1.png -> '/page1.png'
 *    Vite dev & build 都会正确解析。
 */
var storyData = {
    title: '小熊波波的友谊冒险',
    ageGroup: '6-8岁',
    theme: '友谊',
    pages: [
        {
            id: 1,
            content: '波波是一只住在森林里的小棕熊。他有一双好奇的大眼睛和一颗善良的心。每天早晨，波波都会坐在自己的小木屋前，望着远处的大树和花朵，但他从来不敢走得太远。',
            isInteractive: false,
            imagePath: '/page1.png'
        },
        {
            id: 2,
            content: '一天早晨，波波听到一阵欢快的歌声。“那是谁在唱歌呢？”波波好奇地想。他鼓起勇气，第一次离开了自己的小木屋，沿着小路向歌声传来的方向走去。',
            isInteractive: false,
            imagePath: '/page2.png'
        },
        {
            id: 3,
            content: '波波来到了一片开阔的草地。他看到一只小兔子正在那里采摘野花。小兔子有着雪白的毛发和粉红的鼻子，正哼着波波从未听过的歌曲。',
            isInteractive: false,
            imagePath: '/page3.png'
        },
        {
            id: 4,
            content: '波波想和小兔子交朋友，但他不知道该怎么开始。他站在那里，紧张地搓着自己的小爪子。',
            isInteractive: true,
            interactiveQuestion: '如果你是波波，你会怎么向小兔子打招呼呢？你会说些什么来介绍自己？',
            guidancePrompt: '让我来帮你思考一下。如果你是波波，你可能会说“你好”，或者“我叫波波”。你也可以问小兔子的名字，或者告诉她你喜欢她的歌声。你想对小兔子说什么呢？',
            imagePath: '/page4.png'
        },
        {
            id: 5,
            content: '小兔子看到了波波，友好地笑了笑。“你好，我叫莉莉！”小兔子说，“我正在采集这些美丽的花朵，准备做一个花环。你想一起来吗？”波波点点头，慢慢地走近了莉莉。',
            isInteractive: false,
            imagePath: '/page5.png'
        },
        {
            id: 6,
            content: '波波和莉莉一起采集花朵，他们边采边聊。莉莉告诉波波，森林里还有许多其他的动物朋友。“我们每周五都会在大橡树下举行野餐会，”莉莉说，“你愿意来参加吗？”',
            isInteractive: false,
            imagePath: '/page6.png'
        },
        {
            id: 7,
            content: '波波既兴奋又紧张。他从来没有参加过野餐会，也没有见过那么多的动物朋友。但莉莉的笑容让他感到安心，于是他答应了。',
            isInteractive: false,
            imagePath: '/page7.png'
        },
        {
            id: 8,
            content: '周五到了，波波来到了大橡树下。那里已经聚集了许多动物：一只聪明的猫头鹰、一对活泼的松鼠兄弟、一只慢吞吞的乌龟，还有莉莉。波波站在一旁，不知道该做什么。',
            isInteractive: true,
            interactiveQuestion: '波波看到这么多新朋友有点害怕。如果你是波波，你会怎么融入这个新的朋友圈子？你会先和谁说话，为什么？',
            guidancePrompt: '让我来帮你思考一下。波波可以先和他认识的莉莉打招呼，因为她已经是他的朋友了。或者，他可以去和看起来友善的乌龟说话，因为乌龟说话慢，可能不会让波波感到压力。你觉得波波应该怎么做呢？',
            imagePath: '/page8.png'
        },
        {
            id: 9,
            content: '野餐会上，大家分享了各自带来的美食。猫头鹰带来了蜂蜜饼干，松鼠兄弟带来了坚果沙拉，乌龟带来了新鲜的浆果。波波没有带任何东西，他感到有些难过。',
            isInteractive: false,
            imagePath: '/page9.png'
        },
        {
            id: 10,
            content: '“别担心，波波，”莉莉轻声说，“重要的不是你带了什么，而是你来了。友谊不是用礼物来衡量的，而是用心来感受的。”波波听了，心里暖暖的。',
            isInteractive: false,
            imagePath: '/page10.png'
        },
        {
            id: 11,
            content: '随着时间的推移，波波和森林里的动物们成为了好朋友。他们一起玩耍，一起解决问题，一起度过了许多快乐的时光。波波不再是那个害羞的小熊了，他学会了分享、倾听和关心他人。',
            isInteractive: true,
            interactiveQuestion: '友谊给波波带来了哪些变化？你能想到一个你和朋友一起解决问题的经历吗？请分享这个故事。',
            guidancePrompt: '让我来帮你思考一下。友谊让波波变得更勇敢、更快乐了。你有没有和朋友一起解决过问题？比如一起完成作业，一起整理玩具，或者一起想办法帮助别人？请告诉我你的经历。',
            imagePath: '/page11.png'
        },
        {
            id: 12,
            content: '现在，每天早晨，波波都会兴高采烈地离开自己的小木屋，去拜访他的朋友们。他知道，真正的友谊需要勇气去开始，需要时间去培养，更需要真心去维护。在森林里，波波找到了属于自己的幸福。',
            isInteractive: false,
            imagePath: '/page12.png'
        }
    ]
};
exports.default = storyData;
