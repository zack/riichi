# 步骤

## 1. 番数

把手牌中所有役的番数加起来。役种列在“役种”标签页中。

如果手牌有多种拆法，取点数最高的那一种。点数相同时，取番数多的，其次取符数多的。

每张宝牌和每张赤宝牌 **+1番**。

宝牌顺序： ^^9m>1m 1h>2h>3h>4h>1h 5h>6h>7h>5h^^

### 立直了吗？

里宝牌也算。

### 5番或以上？

符数不再影响点数。直接看第5步。

## 2. 面子的符

### 七对子？

固定为 **25符**，不再加任何符。直接看第5步。

### 顺子？

**0符** ^^234s^^

### 刻子或杠子？

**2符** ^^888p^^

- 不是副露得来的，×2。荣和完成的刻子算作明刻。
- 幺九牌（1、9数牌及字牌），×2
- 杠子，×4

## 3. 听牌和雀头的符

### 嵌张或边张？

**2符** ^^13m 89m^^

### 单骑？

**2符** ^^2s^^

两面听牌和双碰听牌为0符。

### 雀头是三元牌、场风牌或自风牌？

**2符**，既是场风又是自风（连风牌）则为4符

## 4. 和牌的符

任何和牌都从 **20符** 算起。

### 门前荣和？

**+10符**

### 自摸？

**+2符**，平和除外

### 有副露，且第2、3步没有任何符？

**+2符**，进位后为30符。

把第2、3、4步的符加起来，再**向上进位至最接近的10位**。

启用<strong>精确符数（不进位）</strong>时，答案是进位前的合计。

## 5. 点数

在“点数表”标签页中按番数和符数查表，或者自己计算：

<math><mtext>基本点数</mtext><mo>=</mo><mtext>符数</mtext><mo>×</mo><msup><mn>2</mn><mrow><mn>2</mn><mo>+</mo><mtext>番数</mtext></mrow></msup></math>

超过 2,000 时按 2,000 计算，这就是满贯。更高的等级各有固定的基本点数：6～7番为 3,000，8～10番为 4,000，11～12番为 6,000，13番起为 8,000。

- 子家荣和：放铳者支付 <math><mn>4</mn><mo>×</mo><mtext>基本点数</mtext></math>。
- 亲家荣和：放铳者支付 <math><mn>6</mn><mo>×</mo><mtext>基本点数</mtext></math>。
- 子家自摸：亲家付 <math><mn>2</mn><mo>×</mo><mtext>基本点数</mtext></math>，其余两名子家各付 <math><mn>1</mn><mo>×</mo><mtext>基本点数</mtext></math>。
- 亲家自摸：三名子家各付 <math><mn>2</mn><mo>×</mo><mtext>基本点数</mtext></math>。

每一笔支付都向上进位至最接近的100点。

## 6. 本场

每有一根本场棒，荣和 **+300**，自摸时每家各 **+100**。

只有启用<strong>本场棒</strong>时，练习器才会问这一项。

## 符数速览

- **20** 任何和牌。七对子为25，不再加符。
- **+10** 门前荣和
- **+2** 自摸，平和除外
- **+2** 雀头是三元牌、场风牌或自风牌。既是场风又是自风则为4。
- **+2** 嵌张、边张或单骑听牌
- **+2** 每个刻子。不是副露得来的 ×2，幺九牌 ×2，杠子 ×4。
- **+2** 有副露且没有其他加符的牌（进位后为30）
- **=** 向上进位至最接近的10位

# 役种

%%yaku-list%%

# 点数表

%%scoring-table%%

**超过70符？** 1番或2番时，从50符起，把两个较小符数的点数相加。80符就是50符加30符，90符就是50符加40符，以此类推。

## 本场

每有一根本场棒，荣和加 **300**，自摸时每家支付的点数各加 **100**。

# 关于

> **关于翻译**：为方便更多人阅读，本页面由AI翻译，其中一部分尚未经人工校对。如发现翻译问题，请在[GitHub](https://github.com/zack/riichi)上反馈。

## 规则

所有手牌均提取自天凤（Tenhou）的游戏日志，并按天凤规则计分。

## 番数、符数、点数

选择想要练习的项目。

## 精确符数（不进位）

要求回答精确的答案，而不是进位后的答案。

## 满贯免算符

满贯以上的手牌不会问符数。

## 切上满贯

4番30符和3番60符视为满贯。

## 本场棒

在练习中加入本场棒。

## 致谢

本站是 Varantha 的 [Riichi Mahjong Score Trainer](https://github.com/Varantha/Mahjong-ScoringTrainer) 的分支。牌例和算分逻辑均来自原项目。

立体牌由 [Cangjie6](https://commons.wikimedia.org/wiki/User:Cangjie6) 绘制，其中一部分是根据 Jerry Crimson Mann 和 Dewclouds 的原作重新制作的。这些牌收录于[维基共享资源](https://commons.wikimedia.org/wiki/Category:SVG_Oblique_illustrations_of_Mahjong_tiles)，以 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 许可发布。本站压缩了文件大小，并在每张红5上加了一个圆点，背面朝上的牌和应用图标也是以这些牌为基础制作的。

本帮助的大部分内容来自 [Aranlyde 制作的速查表](https://www.reddit.com/r/Mahjong/comments/l5b221/riichi_mahjong_cheat_sheet_1_page_pdf_or_images/)，该速查表以 [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) 发布。

© %%year%% Zack Youngren · [GPL-3.0-or-later](https://www.gnu.org/licenses/gpl-3.0.html) · [github.com/zack/riichi](https://github.com/zack/riichi)
