// ============================================================
//  燃燒殆盡之前
//  職場倦怠互動故事
//  tag 規範：
//    # bg: id          切換背景
//    # bgm: id / none  播 / 停 BGM
//    # se: id          音效
//    # speaker: 名字   說話者（無則旁白）
//    # chara: id pose=X pos=left|center|right [exit]
//    # clear           清除所有立繪
// ============================================================

VAR ending_id = ""

-> start

// ============================================================
//  幕零：代入主角
// ============================================================

=== start ===

# bg: metro_night
# bgm: ambient_train

捷運在夜裡搖晃著，車廂裡只剩你和幾個疲倦的臉。

你不知道為什麼，打開了手機的備忘錄。

最後一則是兩年前的。

「這是我的第一份工作。我想成為讓自己驕傲的人。」

你盯著那行字看了很久。

現在的感覺是——

* [「有點好笑。那時候真的很傻。」]
    # se: click
    -> prologue_bitter
* [「說不出話來。」]
    # se: click
    -> prologue_numb

=== prologue_bitter ===
# speaker: 你
你輕輕笑了一下，關掉備忘錄。

傻氣的期待。每個人都有過。

# bg: metro_night

捷運到站了。你拎起背包，走出去。

-> act1_start

=== prologue_numb ===
# speaker: 你
你沒有笑。

只是把手機放回口袋，望向窗外黑色的隧道。

# bg: metro_night

捷運到站了。你拎起背包，走出去。

-> act1_start


// ============================================================
//  幕一：週五深夜
// ============================================================

=== act1_start ===

# bg: office_night
# bgm: office_hum
# clear

晚上九點二十分。

廣告公司的開放式辦公室只剩你們兩個人——你，和你旁邊的小雯。

螢幕的光把臉打得很白。

你的提案已經改了七次。

剛剛 Jason 傳訊息來：「方向還是不對，客戶明天要，再調一版。」

你看著那句話，沒有動。

# chara: xiaowen pose=neutral pos=right

小雯從螢幕後面抬起頭，看了你一眼。

「你還好嗎？」 # speaker: 小雯

你停下手指。

* [「沒事，習慣了。」]
    # se: click
    -> act1_suppress
* [「說真的，我不知道我在幹嘛。」]
    # se: click
    -> act1_honest

=== act1_suppress ===

# speaker: 你
「沒事，習慣了。」

# chara: xiaowen pose=concerned pos=right
# speaker: 小雯
「……習慣了，是好事還是壞事？」

你沒有回答。

# speaker: 你
「你先回去吧，我還要一陣子。」

# chara: xiaowen pose=sad pos=right
# speaker: 小雯
「好。」

她把外套套上，看了你一眼，沒有再說什麼。

# chara: xiaowen exit
# se: door_close

你一個人繼續坐在螢幕前。

改稿。儲存。傳出去。

十一點半，你關燈離開。

-> act2_branch_A

=== act1_honest ===

# speaker: 你
「說真的，我不知道我在幹嘛。」

你自己也沒料到會說出這句話。

# chara: xiaowen pose=surprised pos=right
# speaker: 小雯
「……」

她沒有立刻回應。只是把椅子往你那邊轉了一點。

# chara: xiaowen pose=gentle pos=right
# speaker: 小雯
「我兩年前也有過那種感覺。」

# speaker: 你
「後來呢？」

# speaker: 小雯
「後來我想清楚了一件事。」

她頓了一下。

# speaker: 小雯
「這份工作不是我的全部，但我要弄清楚，對我來說它到底是什麼。」

你沉默著。

# speaker: 小雯
「好了，你先做吧。我等一下走。」

她轉回螢幕。

你改完稿，傳出去。

十一點，你們一起關燈離開。

-> act2_branch_B


// ============================================================
//  幕二A：週末 · 麻痺
// ============================================================

=== act2_branch_A ===

# bg: bar_night
# bgm: bar_ambient
# clear

週六晚上，阿偉把你拖出來。

「幹你再不出門你就廢掉了。」 # speaker: 阿偉 # chara: awei pose=grin pos=left

你坐在酒吧的高腳椅上，啤酒喝了一半。

# speaker: 阿偉
「最近怎樣？你臉色很差。」

* [「不怎樣，工作的事。」]
    # se: click
    -> act2A_talk
* [「還好，喝酒就好。」]
    # se: click
    -> act2A_avoid

=== act2A_avoid ===

# speaker: 你
「還好，喝酒就好。」

# chara: awei pose=skeptical pos=left
# speaker: 阿偉
「行吧。」

你們喝到凌晨一點，聊了一些沒意義的事。

回家之後你倒在床上，睡著前腦子裡還在閃 Jason 的那句話。

-> act3_letter_A

=== act2A_talk ===

# speaker: 你
「不怎樣，工作的事。改稿改到煩死了，主管說方向不對，客戶明天要。」

# chara: awei pose=serious pos=left
# speaker: 阿偉
「你做多久了？」

# speaker: 你
「快三年。」

# speaker: 阿偉
「快三年還在幹這種事啊。」

# chara: awei pose=grin pos=left
# speaker: 阿偉
「我跟你說，我現在新創這邊，雖然也是累，但至少是為自己在拚。」

你看著他說話，沒有太大的感覺。

# speaker: 你
「為自己在拚……聽起來很帥。」

# speaker: 阿偉
「是真的累啊，但累法不一樣。」

你沒有回應。

喝到凌晨一點。回家，倒在床上。

-> act3_letter_A


// ============================================================
//  幕二B：週末 · 裂縫
// ============================================================

=== act2_branch_B ===

# bg: cafe_day
# bgm: cafe_ambient
# clear

週六下午，阿偉說要見你。

你們坐在巷子裡的咖啡館，陽光從窗戶斜進來。

# chara: awei pose=relaxed pos=left

# speaker: 阿偉
「你最近怎麼了？小雯說你昨晚狀態不太好。」

你有一點意外她說了。

# speaker: 你
「她說了什麼？」

# speaker: 阿偉
「說你說了一句『不知道自己在幹嘛』。她擔心你。」

你低頭看著杯子。

# speaker: 阿偉
「說說看？」

* [跟他說得比較多]
    # se: click
    -> act2B_open
* [說了個大概就帶過]
    # se: click
    -> act2B_skim

=== act2B_skim ===

# speaker: 你
「就是倦了。快三年了，一直在改稿、開會、被退件。不知道有沒有意義。」

# chara: awei pose=listening pos=left
# speaker: 阿偉
「嗯。」

他沒有馬上給建議。就只是點頭。

# speaker: 阿偉
「你有沒有想過，你到底想要的是什麼？」

你沉默了一下。

# speaker: 你
「不知道。這就是問題所在。」

-> act2B_end

=== act2B_open ===

# speaker: 你
「就是……每次做出來的東西，都不是我想做的。客戶要的是安全的，主管要的是快，沒有人在乎做的人想什麼。」

# chara: awei pose=serious pos=left
# speaker: 阿偉
「那你想做什麼？」

你停下來想了很久。

# speaker: 你
「我也忘了。」

# chara: awei pose=gentle pos=left
# speaker: 阿偉
「那也許值得想清楚。」

-> act2B_end

=== act2B_end ===

# speaker: 阿偉
「我在新創這邊，當然也是很累。但至少我知道我為什麼要這樣累。」

# chara: awei pose=grin pos=left
# speaker: 阿偉
「你要找到那個『為什麼』。不一定是換工作，但一定要知道。」

你們聊到傍晚才散。

走在回家的路上，你想著他說的話。

-> act3_letter_B


// ============================================================
//  幕三A：翻到那張紙
// ============================================================

=== act3_letter_A ===

# bg: bedroom_night
# bgm: quiet_room
# clear

週日下午，你在整理桌子。

一張對折的紙從抽屜縫隙裡滑出來。

你展開它。

「入職第一天的期望。」

你自己寫的。日期是兩年前。

「我希望做出讓人記得的作品。我希望每天早上起來，有一點點期待。」

你怎麼面對這張紙？ # minigame: letter

* [直接折起來，放回去。]
    -> act4_branch_X
* [坐下來，把它讀完。]
    -> act4_branch_Y_from_A


// ============================================================
//  幕三B：翻到那張紙
// ============================================================

=== act3_letter_B ===

# bg: bedroom_day
# bgm: quiet_room
# clear

週日早上，你在整理桌子。

一張對折的紙從抽屜縫隙裡滑出來。

你展開它。

「入職第一天的期望。」

你自己寫的。日期是兩年前。

「我希望做出讓人記得的作品。我希望每天早上起來，有一點點期待。」

昨天阿偉說的話還在你腦子裡轉。

你怎麼面對這張紙？ # minigame: letter

* [直接折起來，放回去。]
    -> act4_branch_Y_from_B
* [坐下來，把它讀完。]
    -> act4_branch_Z


// ============================================================
//  幕四X：沉默慣了
// ============================================================

=== act4_branch_X ===

# bg: office_morning
# bgm: office_hum
# clear

週一早上，你準時進公司。

Jason 在你到之前就已經坐在位置上了。

他把螢幕轉過來。

「客戶昨晚回信了，說這版勉強可以，但他們還有一個新需求。」 # speaker: Jason # chara: jason pose=neutral pos=left

他沒有道謝，也沒有說辛苦了。

只是把新的 brief 丟在你桌上。

你低頭看著那份 brief。

今天怎麼過？

* [默默開始做，什麼都不說。]
    # se: click
    -> act5_branch_P_silent
* [說「我想請半天假」，然後離開。]
    # se: click
    -> act5_branch_P_leave


// ============================================================
//  幕四Y：動搖邊緣
// ============================================================

=== act4_branch_Y_from_A ===
-> act4_branch_Y

=== act4_branch_Y_from_B ===
-> act4_branch_Y

=== act4_branch_Y ===

# bg: office_morning
# bgm: office_hum
# clear

週一早上，你比平常早到十五分鐘。

辦公室還很安靜。

你坐下來，打開上週沒做完的提案，又關掉。

# chara: xiaowen pose=neutral pos=right

小雯走進來，看到你，有點意外。

「這麼早？」 # speaker: 小雯

你點頭，沒有說話。

她在旁邊坐下，沉默了一陣。

「上週五的事，你後來怎樣了？」 # speaker: 小雯

你要怎麼說？

* [「還是那樣，沒什麼進展。」]
    # se: click
    -> act5_branch_Q_vague
* [「我想跟 Jason 談一談。」]
    # se: click
    -> act5_branch_Q_resolve


// ============================================================
//  幕四Z：看清了
// ============================================================

=== act4_branch_Z ===

# bg: bedroom_day
# bgm: quiet_room

你把那張紙讀了兩遍。

有些字你記得寫下來的時候的感覺。

你拿出一張新紙，在空白處寫下：

「我現在還有這些感覺嗎？」

「有哪些是真的不見了？哪些是被壓著？」

你寫了半小時，沒有具體結論，但感覺稍微清楚了一點。

# bg: office_morning
# bgm: office_hum
# clear

週一早上。

Jason 進來，把一份新 brief 放在你桌上。

「這週還有一個急案，一起處理。」 # speaker: Jason # chara: jason pose=neutral pos=left

你看著那份 brief，沒有立刻動。

「Jason，我能跟你說一件事嗎？」 # speaker: 你

他皺了一下眉。

「什麼事？」 # speaker: Jason # chara: jason pose=frown pos=left

你要怎麼說？

* [「我想談一下工作量的問題。」]
    # se: click
    -> act5_branch_Z_negotiate
* [「沒事，我先開始做。」]
    # se: click
    -> act5_branch_Z_retreat


// ============================================================
//  幕五P：最後一根稻草
// ============================================================

=== act5_branch_P_silent ===

# bg: office_day
# bgm: office_hum
# chara: jason pose=neutral pos=left

你默默開始做。

做了一個小時，Jason 站起來，走到你桌邊。

「這個 layout 不對，客戶說過他們喜歡留白，你沒記下來嗎？」 # speaker: Jason

他說得很大聲，開放式辦公室的每個人都聽見了。

你感覺臉有點熱。

* [沉默，繼續修改。]
    # se: click
    -> ending_A
* [抬起頭，直視他。]
    # se: click
    -> ending_B_spark

=== act5_branch_P_leave ===

# bg: park_morning
# bgm: park_ambient
# clear

你說要請半天假。

Jason 沒有問原因，只是點頭說「下午要來」。

你走出辦公室，在附近的公園坐下來。

風吹過來。

你坐了很久，什麼都沒做。

中午，你的手機亮了。

是一封陌生的信。

「關於您投遞的職位，我們想邀請您來面試……」

你盯著那封信。

你已經不記得自己什麼時候投過這間公司了。

* [刪掉那封信，下午回公司。]
    # se: click
    -> ending_A
* [回信，確認面試時間。]
    # se: click
    -> ending_B_interview


// ============================================================
//  幕五Q：那次對話
// ============================================================

=== act5_branch_Q_vague ===

# bg: office_day
# bgm: office_hum
# chara: xiaowen pose=gentle pos=right

「還是那樣，沒什麼進展。」 # speaker: 你

小雯沉默了一下。

「有時候沒有進展，只是因為你還在醞釀。」 # speaker: 小雯

你不確定她說得對不對，但聽完感覺稍微鬆了一點。

# chara: xiaowen exit
下午，Jason 開會的時候說到你負責的那個案子。

「這個方向我不太滿意，但時間不夠了，就這樣送出去。」 # speaker: Jason # chara: jason pose=dismissive pos=left

你知道那個方向是你提的。

他沒有多說什麼，就進入下一個議題。

你要怎麼回應？

* [什麼都不說，繼續開會。]
    # se: click
    -> ending_A
* [會議結束後去找他。]
    # se: click
    -> ending_C_talk

=== act5_branch_Q_resolve ===

# bg: office_day
# bgm: office_hum
# chara: xiaowen pose=surprised pos=right

「我想跟 Jason 談一談。」 # speaker: 你

小雯抬起頭。

「認真的？」 # speaker: 小雯

「嗯。不是要吵架，就是……我覺得我們之間有些事情一直沒說清楚。」 # speaker: 你

# chara: xiaowen pose=gentle pos=right
「那就去說。」 # speaker: 小雯

她停了一下。

「你知道為什麼很多人不去說嗎？因為怕說了也沒用。但不說的話，一定沒用。」 # speaker: 小雯

# chara: xiaowen exit
下午，你在走廊等到 Jason 出來。

「Jason，你有幾分鐘嗎？我想跟你說一件事。」 # speaker: 你 # chara: jason pose=neutral pos=left

他看著你。

「什麼事？」 # speaker: Jason

* [說清楚你的狀況和需求。]
    # se: click
    -> ending_C_talk
* [「沒事，算了。」]
    # se: click
    -> ending_A


// ============================================================
//  幕五R：交叉路口
// ============================================================

=== act5_branch_Z_negotiate ===

# bg: office_day
# bgm: office_hum
# chara: jason pose=listening pos=left

「我想談一下工作量的問題。」 # speaker: 你

Jason 看著你，沒有立刻說話。

你繼續說。

「這個月我同時在跑四個案子，上週五那個提案改了七版。我沒有辦法在這個量下保持品質。」 # speaker: 你

沉默。

# chara: jason pose=thinking pos=left
「你說的量是指……？」 # speaker: Jason

「我可以列出來，但我的意思是，我需要在工作量和品質之間有一個比較合理的平衡。」 # speaker: 你

Jason 沉默了更久。

「我知道了，我下週排一個時間我們再談。」 # speaker: Jason # chara: jason pose=neutral pos=left

他沒有承諾什麼。

你也不確定這次談話有沒有用。

但你說出去了。

幾天後，面試邀請進來了。

# bg: bedroom_night
# bgm: quiet_room
# clear
# se: notification

那是你三週前投的一間公司的通知。

你當時只是試著投投看。

你要怎麼做？

* [去面試。不管結果如何，先知道外面的樣子。]
    # se: click
    -> ending_B_interview
* [先等等，看 Jason 那邊的進展。]
    # se: click
    -> ending_C_wait

=== act5_branch_Z_retreat ===

# bg: office_day
# bgm: office_hum

「沒事，我先開始做。」 # speaker: 你

你低下頭，打開那份 brief。

# chara: jason exit

Jason 走回他的位置。

你做了一整天。

晚上七點，你傳出稿子。

收拾包包準備走的時候，手機震了一下。

# se: notification
是一封面試邀請。

三週前你投的那間公司。

你當時只是試著投投看。

# bg: metro_night
# bgm: ambient_train
# clear

你在捷運上盯著那封信看了很久。

你要怎麼做？

* [回信確認，去看看。]
    # se: click
    -> ending_B_interview
* [沒有回覆，繼續現在的生活。]
    # se: click
    -> ending_A


// ============================================================
//  結局 A：繼續燃燒
// ============================================================

=== ending_A ===

# bg: office_morning
# bgm: soft_resolve
# clear

你繼續在那個位置坐下去。

不是因為你想通了，也不是因為你甘願。

而是你開始明白一件事：

這份工作是你的一部分，但不是全部。

從這天起，你開始學著設定邊界。

下班之後不看工作訊息。

週末不改稿，除非是真的緊急。

你說了幾次「這個量我做不到」，Jason 有時候皺眉，有時候沒有回應，但世界沒有因此崩潰。

# bg: office_evening

幾個月後的某一天，你在準備下班的時候，突然想起了那張紙。

「我希望每天早上起來，有一點點期待。」

你現在有嗎？

也許還沒有。

但你知道邊界在哪了。

而那，已經是某種開始。

~ ending_id = "A"
// ~ END ~
-> END

// ============================================================
//  結局 B：離開找答案
// ============================================================

=== ending_B_spark ===
-> ending_B

=== ending_B_interview ===
-> ending_B_interview_scene

=== ending_B_interview_scene ===

# bg: office_building_day
# bgm: city_ambient
# clear

你去了那個面試。

對方是一間小一點的公司，做品牌設計。

面試官問你：「你為什麼想離開現在的公司？」

你想了很久，說：

「我想找到一個還願意問自己『為什麼』的地方。」 # speaker: 你

對方看著你，點了點頭。

-> ending_B

=== ending_B ===

# bg: office_lobby
# bgm: soft_resolve
# clear

那一天你遞出辭呈。

Jason 點了頭，說了句「你想清楚了？」

「嗯。」 # speaker: 你

他沒有再多說什麼。

你收拾了桌上的東西。

一個馬克杯，幾支筆，那個你一直帶著但從沒打開的小植物。

# bg: office_exit

走出辦公室的時候是下午四點。

陽光很直，打在你臉上。

你站在門口站了一會兒。

不確定下一步是什麼。

不確定這個決定對不對。

但你知道繼續待著，是一定不對的。

風吹過來。

你把背包背好，往前走。

~ ending_id = "B"
// ~ END ~
-> END

// ============================================================
//  結局 C：先停下來
// ============================================================

=== ending_C_talk ===

# bg: meeting_room
# bgm: quiet_room
# chara: jason pose=listening pos=left

你跟 Jason 進了一間小的會議室。

你說了很多你平時不說的事。

工作量。你對品質的在意。你覺得每次改稿改到最後，已經不知道原來在做什麼了。

Jason 靜靜地聽著。

「我知道這段時間你承受了很多。」 # speaker: Jason # chara: jason pose=serious pos=left

你有點意外他這樣說。

「我自己也在壓力下，有些事情沒有處理好。」 # speaker: Jason

他沒有說什麼承諾。

但他說：「下週我們來重新排一下你的案子，看看哪些可以調整。」 # speaker: Jason

-> ending_C

=== ending_C_wait ===

# bg: office_day
# bgm: office_hum
# clear

你等了兩週。

Jason 排了一個會。

你們談了大約半小時。

他說他會減少你同時進行的案子數量。

不是完美的解決，但是一個開始。

-> ending_C

=== ending_C ===

# bg: office_morning
# bgm: soft_resolve
# clear

事情沒有一下子變好。

有些週還是很累，有些會議還是讓你覺得不被聽見。

但有些事情不一樣了。

你知道可以開口說。

你知道說了，不一定會死。

# bg: park_morning

某個週五下班，你路過一間文具店，進去買了一本新的筆記本。

你也不知道要記什麼。

只是想把一些東西寫下來。

你打開第一頁，在上面寫：

「我還在這裡。我還在想。」

也許這就夠了。

~ ending_id = "C"
// ~ END ~
-> END
