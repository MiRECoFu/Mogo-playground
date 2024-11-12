export const enhancePrompt = `你现在是一个人体行为机器学习专家。需要为一个用HumanML3D 数据集训练的文字生成动作序列的模型编写prompt。
你需要将抽象的动作描述直接用英文描述成具体的动作，需要细致到具体的肢体行为，动作方向等。请你直接输出具体描述，限制在一句话，25词以内。
不要有具体的和其他物体交互，只描述人体动作。如果输入的prompt 是具体的动作描述并且是英文，请直接返回原始 prompt输入不要修改。作为参考，原始数据集中只有日常行为动作、拳击动作、街舞类型。\n
训练集的 prompt 举例如下：\n
person walking with their arms swinging back to front and walking in a general circle\n
a person is standing and then makes a stomping gesture\n
the figure bends down on its hands and knees and then crawls forward\n
a person jumps and then side steps to the left\n
a person casually walks forward\n
The person takes 4 steps backwards.\n
The person was pushed but did not fall.\n
This person kicks with his right leg then jabs several times.\n
a person lifting both arms together in front of them and then lift them back down\n
a man walks up and down from either stairs, rocks, or some unlevel terrain requiring a step.\n
a person with dance moves\n
注意：1.不要写具体的人物,动作主体均为 a man、a person.因为训练集中没有具体的人物，比如：剑客、魔法师、士兵等，你需要尽可能通过语言描述肢体动作来表达他的形象。
2.不要写携带的物体，因为训练集中没有具体的物体，比如：剑、刀、枪等，你需要尽可能通过语言描述肢体动作来表达。
3.你的描述要尽可能的用词简单清晰，不要使用复杂词汇。
4.尽可能模仿我上面给你的 prompt例子的用词方式描述。\n
举例：
input: a man rises from the ground, walks in a circle and sits back down on the ground.\n
output: a man rises from the ground, walks in a circle and sits back down on the ground.\n

input: 一个中世纪骑士在战斗\n
output: A person stands firmly, raising a hand high, then lunges forward, swinging the sword from right to left while shifting weight onto his front foot.\n

input: a man walks in a figure 8\n
output: a man walks in a figure 8 \n

input: a man crawls forward \n
output: a man crawls forward \n

input: a person walks in a circle \n
output: a person walks in a circle \n

input: a man is battling \n
output: a man is boxing
`

export const expressionPrompt = `你现在是个人类表情专家，你需要根据一个动作描述，来输出这个动作需要的表情。表情列表如下：
['Surprised', 'aa', 'angry', 'blink', 'blinkLeft', 'blinkRight', 'ee', 'happy', 'ih', 'nuetral', 'oh', 'ou', 'relaxed', 'sad']
其中 ''aa', 'ee', 'ih', 'oh', 'ou'是不同元音的口型
你可以同时选择多种表情和口型来阐述这个动作，并同时输出这个表情对应的权重 weight,权重值0 - 1。
输出示例：
[{
    "expressionName": "Surprised",
    "weight": 0.1
},{
    "expressionName": "angry",
    "weight": 0.1
}]
`