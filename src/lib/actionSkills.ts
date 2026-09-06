import { ActionSkill, ActionBible } from './types';

export const ACTION_SKILLS_LIBRARY: ActionSkill[] = [
  {
    id: 'skill-87eleven-gunfu',
    name: '87Eleven 战术枪斗与近身绞杀',
    nameEn: '87Eleven Tactical Gun-Fu & Close-Quarters Grappling',
    category: 'GUN_FU',
    tagline: '好莱坞硬派动作工业巅峰：柔道过肩投技接抵近射击，CAR中心轴持枪重锁，绝对质量惯性。',
    origin: 'Chad Stahelski / David Leitch / 87Eleven Action Design (《疾速追杀》/《极寒之城》)',
    corePhilosophy:
      '将传统柔道/巴西柔术的重心瓦解、缠斗压制与现代战术手枪近距射击无缝缝合。绝无任何无效摆架子动作，每个动作都以剥离对手重心为前置，紧接着在零距离射击或利用对手身体作防弹肉盾。枪械并非独立武器，而是拳锋的直接延伸。',
    signatureCombos: [
      '【大外割抵近绝杀】右手抓握敌方手腕外旋折脱，顺势上步大外割重摔砸地，同时左手拔枪向下莫桑比克射击（两枪躯干一枪眉心）。',
      '【CAR中心轴换弹防反】抵近遭两人合围时，利用CAR（Center Axis Relock）贴胸持枪姿态挡开前劈，借转身手肘后击后侧敌咽喉，0.8秒单手甩匣顶桌撞入新弹匣击发。',
      '【防弹风衣卷臂缠绞】翻滚中解开风衣下摆缠绕敌持刀右手，反关节施压夺刃，反手将刀柄撞击其太阳穴。',
    ],
    impactRhythm:
      '短促高频爆破（0.3秒连续两击折腕）→ 极重钝感砸地（0.5秒尘土飞扬）→ 绝对冷静的收势与弹道视线扫视。杜绝狂乱晃镜头，全靠身体发力与重心转移提供震撼感。',
    cameraChoreo:
      '以中全景（Medium Wide）跟拍为主，保留武指演员完整的脚掌抓地与腿部发力轴线；在投技下砸接触地面的瞬间执行微冲推镜（Micro Punch-in 5%），严禁使用密集跳切掩盖动作破绽。',
    spatialDestruction:
      '人体撞击碎裂展柜钢化玻璃、抛投砸烂木质吧台、地面滑行扬起水花或地毯纤维、抛壳落地的清脆金属回弹。',
    promptKeywords: [
      '87Eleven tactical Gun-Fu choreography',
      'Center Axis Relock pistol stance',
      'visceral judo throw impact inertia',
      'sub-second tactical weapon strip',
      'grounded brutal kinetic physics without wirework',
      'spent brass casings bouncing off wet concrete',
    ],
    fullActionBiblePreset: {
      stuntDesignStyle: '87Eleven Tactical Gun-Fu & Heavy Judo Grappling, zero-wirework realism, seamless firearm-to-hand-to-hand transitions.',
      combatPhysics: 'Strict mass momentum conservation, visceral bone-shattering blunt force, realistic firearm muzzle flip and recoil inertia.',
      weaponDynamics: 'Taran Tactical modified handguns and carbon-fiber blades; micro-clearance muzzle strikes, edge deflection parrying.',
      cameraChoreography: 'Medium-wide tracking shots keeping full body biomechanics in frame, 3-frame micro punch-in on bone impact.',
      impactVelocity: 'Explosive kinetic accelerations punctuated by sudden calculated tactical stillness and eyeline sweeping.',
      spatialDestruction: 'Debris splintering from concrete columns under gunfire, shatter glass raining, heavy furniture destroyed under body throws.',
      safetyAndContinuity: 'Progression of ballistic fabric wear, carbon residue on knuckles, exact slide lock condition maintained across cuts.',
    },
  },
  {
    id: 'skill-donnie-yen-mma',
    name: '甄子丹综合格斗与咏春寸劲截击',
    nameEn: 'Donnie Yen MMA Hybrid & Wing Chun Centerline Trapping',
    category: 'MMA_CQC',
    tagline: '现代实战搏击与传统中国功夫的终极融合：中线压制、泰拳箍颈膝撞与飞身十字固。',
    origin: '甄子丹 / 谷垣健治 / 董玮 (《导火线》/《杀破狼》/《叶问》)',
    corePhilosophy:
      '以咏春拳中线理论与截拳道阻截原则为防守框架，一旦贴身立即切换为泰拳膝肘重击与柔术地面绞杀。强调「受力点停顿（Impact Hold）」与「寸劲震爆」，动作干脆利落、骨骼碰撞声清脆刺耳，兼具香港动作黄金时代的速度与现代擂台综合格斗的实战残暴度。',
    signatureCombos: [
      '【摊掌封中门连环日字冲拳】双手摊绑压制敌双拳中线，0.5秒内连轰6记高速寸劲日字冲拳正中面门，最后一记寸劲推掌将对手震退两米。',
      '【泰拳箍颈连膝撞】闪身避过摆拳，双臂如铁钳箍住对手后颈向下狠拉，右膝连续三次重炮般暴击其肋部与下颌。',
      '【飞身跃起三角绞至十字固】在对手猛扑瞬间起跳双腿锁颈凌空下坠，落地翻滚转为手臂十字固，清脆骨折音后反手夺凶器。',
    ],
    impactRhythm:
      '暴风骤雨般的短促连打（连击如爆豆）→ 致命重击瞬间的 2 帧视觉顿挫（Impact Frame Hold）→ 沉重身体倒地砸击。',
    cameraChoreo:
      '侧面平视中景跟随中线攻防移动；在重膝撞击和飞身关节技空中滞空点使用轻微升格（48fps），落地撞击瞬间恢复24fps以强化打击惯性。',
    spatialDestruction:
      '膝撞落点墙面腻子震落、背部撞击卷帘门引发剧烈震鸣回响、地面尘土随寸劲爆发呈圆环状激荡。',
    promptKeywords: [
      'Donnie Yen modern MMA tactical choreography',
      'Wing Chun centerline trapping and rapid chain punches',
      'visceral Muay Thai clinch knee impacts',
      'flying armbar takedown mechanics',
      'impact frame pause on bone strike',
      'sweat and blood droplets spraying on impact',
    ],
    fullActionBiblePreset: {
      stuntDesignStyle: 'Modern MMA Combat merged with Classical Wing Chun Centerline Trapping; lethal elbow-knee combinations.',
      combatPhysics: 'Heavy bone-on-bone impact shockwaves, sudden torque inertia in joint-locks, explosive short-distance Fa-Jin kinetic energy.',
      weaponDynamics: 'Bare-knuckle precision counter-strikes against blade thrusts; forearm conditioning bone-blocking.',
      cameraChoreography: 'Fluid profile tracking honoring the centerline axis, 2-frame speed ramp pause on decisive jaw/rib impacts.',
      impactVelocity: 'Furious staccato tempo bursts followed by brutal sustained joint submissions and immediate environment rebounds.',
      spatialDestruction: 'Porous plaster crumbling under wall slams, corrugated iron fences buckling from body throws.',
      safetyAndContinuity: 'Progressive knuckle skin abrasion, lip splitting, realistic swelling and bruised tissue across continuous takes.',
    },
  },
  {
    id: 'skill-raid-silat',
    name: '突袭致命班卡西拉近身截杀',
    nameEn: 'The Raid Pencak Silat Visceral Close-Quarters Slaughter',
    category: 'SILAT',
    tagline: '印尼传统班卡西拉的极限生死战术：低架滑步、反手爪刀与狭窄走廊无差别绝杀。',
    origin: 'Gareth Evans / Iko Uwais / Yayan Ruhian (《突袭》/《突袭2》)',
    corePhilosophy:
      '极度压抑空间下的纯粹杀戮机器。低重心马步滑行穿梭于敌方攻击盲区，双手如毒蛇交缠，利用反手爪刀（Karambit）与肘刃进行连续不间断的弧形撕裂。绝不后退，每一记防御都在向前侵略，直接切断肌腱、喉管或利用墙壁棱角震碎头颅。',
    signatureCombos: [
      '【爪刀下潜割腱封喉】贴地滑步避开横砍，反手爪刀斜挑切断对手前腿膝窝肌腱，起身瞬间肘尖上挑击碎下颚，刀刃顺势横抹颈动脉。',
      '【走廊夹角三段式破防】左右手交替拍打格开直刺，右肘下砸砸碎腕骨，左掌托下巴将对手后脑狠狠撞击混凝土墙角。',
      '【双人缠斗反向借力折颈】同时扣住两名持械敌人的小臂互撞，借力翻身反拧其颈椎发出干脆折断声。',
    ],
    impactRhythm:
      '毫无缓冲的连续极速暴击（无间断快节奏发力）→ 血肉撕裂与沉闷撞墙顿击 → 踩踏尸体继续向前压进。',
    cameraChoreo:
      '手持摄影机紧贴演员肩膀与腰线（Shoulder/Hip Rig），随动作狂暴左右摆动，并在刀刃划过的瞬间掠过镜头前方造成强烈前景压迫感。',
    spatialDestruction:
      '白炽灯管打碎迸射耀眼电火花、石膏板隔墙被直接撞穿、墙面溅满扇形暗红血迹并伴随手指滑蹭痕迹。',
    promptKeywords: [
      'The Raid visceral Pencak Silat choreography',
      'reverse-grip Karambit blade slicing dynamics',
      'claustrophobic hallway lethal combat',
      'devastating close-range elbow and knee strikes',
      'unrelenting forward pressure brutal takedowns',
      'blood splatter and concrete wall impact dust',
    ],
    fullActionBiblePreset: {
      stuntDesignStyle: 'Indonesian Pencak Silat lethal close-quarters combat, relentless forward momentum, visceral Karambit knife work.',
      combatPhysics: 'Hyper-kinetic body torque, direct tendon-severing kinetic slicing, brutal skull-against-masonry impacts.',
      weaponDynamics: 'Curved Karambit and tactical machetes; rapid blade spins, hooking limb controls, sparks on iron rebar.',
      cameraChoreography: 'Aggressive low-angle handheld camera tracking actors through claustrophobic corridors with razor-sharp whip pans.',
      impactVelocity: 'Relentless machine-gun cadence without resting intervals; hyper-fast parry-slash transitions.',
      spatialDestruction: 'Punctured drywall, swinging overhead fluorescent light fixtures flickering, pool of water scattering under combat boots.',
      safetyAndContinuity: 'Cumulative arterial spray patterns on walls and costumes, authentic weapon blade nicking and gore buildup.',
    },
  },
  {
    id: 'skill-bourne-kali',
    name: '谍影重重菲律宾短棍与日用品CQB',
    nameEn: 'Bourne Tactical Kali & Improvised Weapon CQB',
    category: 'KALI_IMPROV',
    tagline: '中情局顶级潜伏特工的本能防御：菲律宾武术三角步法、徒手卸刃与就地取材致命杀伐。',
    origin: 'Doug Liman / Paul Greengrass / Damon Caro (《谍影重重》系列)',
    corePhilosophy:
      '极高智商的应激肌肉记忆反应。将身边的任何常见日用品（卷起的厚硬皮书、钢笔、电源线、毛巾、陶瓷盘）在0.1秒内转化为战术冷兵器。步法基于菲律宾魔杖（Kali/Escrima）的倒三角走位，左右开弓瓦解武器攻击线，在3.5秒内彻底瘫痪一名专业杀手。',
    signatureCombos: [
      '【精装硬皮书截刺锁喉】以厚硬皮书书脊格挡刺刀下劈，反手用书角重击持刀手腕夺刀，顺势用书脊猛力顶撞对手喉结使其窒息倒地。',
      '【战术防卫笔锁穴透掌】单手架开擒拿，战术金属笔尖直刺敌手背穴位与锁骨窝，借剧痛引力反别对手小臂将其面部按压在玻璃茶几上。',
      '【毛巾卷束颈摔投】甩动湿毛巾缠住敌方挥砍之匕首并顺势缠绕其颈项，借自身后倾体重瞬间将其重心拽空摔入浴缸。',
    ],
    impactRhythm:
      '微秒级的接触拆解（几乎看不清的短距格挡）→ 致命要害的精确单点暴击 → 立即脱身并搜刮敌方情报装备。',
    cameraChoreo:
      '紧凑跟焦近景（Tight Handheld 50mm），快门角度设为 90° 或 45°（Saving Private Ryan 效应），使快速挥动的拳头与武器带有锋利的频闪拖尾质感。',
    spatialDestruction:
      '小型公寓内家具全面遭殃：翻倒的写字台、打碎的陶瓷水杯、被身体砸碎的镜面百叶窗、撕裂的电线短路爆火花。',
    promptKeywords: [
      'Bourne identity tactical Kali combat choreography',
      'improvised weapon CQB lethal efficiency',
      'Filipino martial arts triangle trapping mechanics',
      '90-degree shutter angle kinetic motion blur',
      'bone-crunching close quarters domestic environment brawl',
      'shattered mirror shards and overturned furniture',
    ],
    fullActionBiblePreset: {
      stuntDesignStyle: 'Filipino Kali & Krav Maga tactical adaptation; improvised weapon weaponization in tight domestic quarters.',
      combatPhysics: 'Surgical nerve-cluster and joint-lock pressure physics, blunt leverage mechanics overriding raw brute strength.',
      weaponDynamics: 'Everyday item weaponization (books, pens, cables) against live steel blades; instant disarms and redirects.',
      cameraChoreography: 'High-shutter-speed gritty handheld camera staying in intense medium close-up, sharp optical tension.',
      impactVelocity: 'Split-second parry sequences executed in under 2 seconds followed by sudden silence and environment scan.',
      spatialDestruction: 'Household furniture smashed into toothpicks, shattered ceramic tiles, water pipe ruptures.',
      safetyAndContinuity: 'Accurate tracking of superficial lacerations from broken glass and blunt hematomas on forearms.',
    },
  },
  {
    id: 'skill-tanigaki-kenjutsu',
    name: '谷垣健治古流剑术与居合拔刀',
    nameEn: 'Kenji Tanigaki Koryū Kenjutsu & High-Velocity Battōjutsu',
    category: 'KENJUTSU',
    tagline: '新世代日本时代剧动作美学巅峰：贴地低空疾驰、超速逆转拔刀与火花四溅的刃脊滑卸。',
    origin: '谷垣健治 / 甄家班 (《浪客剑心》电影系列 / 《邪不压正》)',
    corePhilosophy:
      '将传统天然理心流、拔刀术与现代香港跑酷特技深度重构。强调极低重心的贴地奔袭与突进，出刀前蓄势如引满之弓，出刀后刀光如电。双刀或单刀格挡绝非硬碰硬，而是利用日本刀背「栋（Mune）」与刃脊（Shinogi）进行倾斜滑行卸力，借摩擦出耀眼火星后顺势反切。',
    signatureCombos: [
      '【低空滑铲飞天居合斩】双膝贴地高速滑铲避开漫天暗器，左手拇指顶开刀镡，借滑行惯性自下而上拔刀斜斩敌腹部，借拔刀反震旋转起身。',
      '【刃脊卸力顺势横贯斩】横刀以刀背倾斜45度硬接敌重劈，刀刃滑擦迸射一长串橙色火花，卸力瞬间手腕翻转，刀尖直接贯穿敌咽喉。',
      '【双刀十字架锁逆刃挑斩】左手短胁差交叉锁死敌方武士刀，右手打刀反手回旋自肋下反挑，在敌胸口划出完美X型血痕。',
    ],
    impactRhythm:
      '长达数秒的拔刀前静默（唯有风声与雨滴打在刀鞘上的声音）→ 0.1秒闪电拔刀撕裂空气 → 双方交错背立凝神（延时顿挫）→ 鲜血喷溅倒地。',
    cameraChoreo:
      '超宽变形镜头（Anamorphic 35mm）极低机位（距地面仅10cm）向前高速滑轨推进（Dolly In），捕捉刀刃拔出瞬间反射的第一道冷光；对决瞬间拉高至仰角展现剪影。',
    spatialDestruction:
      '刀气扫过削断竹林竹管整齐滑落、雨幕被刀锋破空撕开一道真空弧线、火花点燃地面落叶与枯草。',
    promptKeywords: [
      'Kenji Tanigaki cinematic Kenjutsu choreography',
      'lightning-fast Battōjutsu draw and strike mechanics',
      'katana blade parry sparks scraping along steel ridge',
      'ultra-low angle tracking shots on wet ground',
      'poetic visual silence transitioning into explosive blade clashes',
      'cherry blossom petals and raindrops sliced in mid-air',
    ],
    fullActionBiblePreset: {
      stuntDesignStyle: 'Koryū Kenjutsu combined with modern Hong Kong wire-grounded speed, authentic Battōjutsu draw dynamics.',
      combatPhysics: 'Inertia of razor-sharp folded tamahagane steel cutting resistance, centrifugal body rotation balance, precise center of gravity.',
      weaponDynamics: 'Authentic katana blade deflection physics; sparks shower along the shinogi (blade ridge), clean blood-wipe flick (Chiburi).',
      cameraChoreography: 'Ground-level 35mm anamorphic dolly tracks matching sprint velocity, heroic low-angle silhouette framing.',
      impactVelocity: 'Stark contrast between absolute Zen stillness and explosive hypersonic slash executions, delayed impact collapse.',
      spatialDestruction: 'Bamboo stalks severed diagonally, tatami mats sliced in half, paper shoji doors shredded along blade vectors.',
      safetyAndContinuity: 'Strict blade edge integrity tracking (nicks and blood grooving), authentic sheath wear and scabbard cord positioning.',
    },
  },
  {
    id: 'skill-krav-maga',
    name: '以军反恐极速夺刃防暴战术',
    nameEn: 'Tactical Krav Maga Lethal Neutralization & Weapon Strips',
    category: 'KRAV_MAGA',
    tagline: '无规则实战自卫与反恐军用格斗：防攻同步、本能反射与瞬间解除敌方致死武装。',
    origin: 'Imi Lichtenfeld / 以色列特种部队 (IDF Counter-Terrorism Units)',
    corePhilosophy:
      '没有任何体育竞技规则的残酷防卫体系。核心在于「防守即进攻（Simultaneous Defense & Attack）」，在敌方出招的第一时间进行斜向位移避开刺入轴线，同一时刻拳锋或手刀已经重创对手眼球、咽喉或下阴。利用人体骨骼杠杆原理在0.5秒内剥除枪支、匕首并瞬间反制。',
    signatureCombos: [
      '【360度外侧格挡击喉】左小臂硬角格挡敌正手扎刀，身体右倾避开攻击轴，同时右掌根全力上托狠击对手下巴鼻梁造成剧烈脑震荡。',
      '【手枪抓套筒折指夺械】面对持枪指头，双手瞬间外拨使枪口偏离头部，四指死死抓住滑套使其无法击发二次复进，反拧对手食指折断其扳机指并夺枪。',
      '【近身缠抱摔地踩膝】冲入对手内门头槌撞击其面门，顺势双腿扫摔其支撑脚，在对手倒地瞬间以军靴重跺其膝盖反向折断关节。',
    ],
    impactRhythm:
      '雷霆一击的直接破防（没有连续空击试探）→ 敌方武装解除瞬间的静止压制 → 致命终结。',
    cameraChoreo:
      '平视真实执法记录仪视点或第三人称战术跟拍，镜头稳定器保持平缓推移，突出每一次动作的物理合理性与不可抗拒性。',
    spatialDestruction:
      '手枪走火子弹击穿天花板水管喷水、对手被摔入垃圾箱引发剧烈金属凹陷、夺下的刀刃被直接反插在桌面固定。',
    promptKeywords: [
      'military Krav Maga lethal neutralization choreography',
      'simultaneous defense and counter-attack biomechanics',
      'sub-second tactical pistol and knife disarms',
      'brutal close quarters self-defense realism',
      'zero wasted motion military efficiency',
      'uncompromising visceral street combat impact',
    ],
    fullActionBiblePreset: {
      stuntDesignStyle: 'Military Krav Maga close-quarters defense, raw survival brutalism, instant weapon neutralizations.',
      combatPhysics: 'Direct anatomical vulnerability targeting (eyes, throat, groin, joints), leverage over mass disparity.',
      weaponDynamics: 'Rapid slide-grab handgun disarms preventing chamber cycles; wrist-lock knife strips.',
      cameraChoreography: 'Documentary-style visceral framing, stable medium lenses capturing mechanical clarity of disarms.',
      impactVelocity: 'Explosive singular defense-strikes followed immediately by dominant mechanical limb locks.',
      spatialDestruction: 'Uncontrolled firearm discharge ricochets, vehicle hoods dented from body impacts.',
      safetyAndContinuity: 'Realistic joint dislocation posturing, authentic bruising on forearms from hard-edge parrying.',
    },
  },
  {
    id: 'skill-neijia-fa-jin',
    name: '新派武侠内家沉劲与缠丝发力',
    nameEn: 'Heavy-Grounded Wuxia Neijia & Internal Fa-Jin Kinetic Shock',
    category: 'WUXIA_NEIJIA',
    tagline: '摒弃轻功飘忽假把式的新派硬武侠：沉肩坠肘、缠丝走化与近身寸距内劲震爆。',
    origin: '徐浩峰 (《师父》/《箭士柳白猿》) / 王家卫 (《一代宗师》)',
    corePhilosophy:
      '彻底颠覆老式武侠飞天吊威亚的浮夸虚假，回归民国武术形意、八卦、咏春的「沉底真实杀伤」。脚下生根如铸铁，动作幅度极小但每一击蕴含全身骨骼贯通之重力势能。讲究「听劲」与「接化发」，兵器交锋清脆短促，胜负只在一寸一毫的闪避与寸劲穿透之中。',
    signatureCombos: [
      '【八卦穿掌缠丝卸刀】面对双刀下劈，侧身拧腰步踏九宫，掌缘沿刀刃侧面如游鱼滑入，寸步靠身一记八极「贴身靠」将对手胸骨震碎倒飞。',
      '【八斩刀贴面听劲截腕】手持双短刀反手闭合，刀身如剪刀合拢架住长枪枪头，沿枪杆疾速滑切对手十指，顺势刀尖抵喉。',
      '【形意半步崩拳贯胸】后脚一蹬向前垫步，右拳如出膛炮弹直轰敌心口，发力瞬间全身衣袍剧烈抖动，对手后背衣服被内劲震得开裂。',
    ],
    impactRhythm:
      '屏息凝气的微步逼近（水滴与脚步声）→ 接触刹那0.05秒的内劲震荡（衣衫炸响、脚底积水爆开）→ 对手口鼻溢血缓缓跪倒。',
    cameraChoreo:
      '固定机位（Static Master）与特写（Extreme Close Up）交替：先以大景别展现两人肃穆沉稳的架势步法，在发劲瞬间切至脚下石板碎裂与拳锋落点的宏观特写。',
    spatialDestruction:
      '脚底青石板被蹬出放射状裂纹、发力瞬间周围雨水被气浪震散成微米级白雾、落叶被拳风卷入旋转后崩碎。',
    promptKeywords: [
      'Xu Haofeng grounded realistic martial arts cinema',
      'internal Fa-Jin kinetic explosion mechanics',
      'Wing Chun Ba Zan Dao double short blade parrying',
      'rooted iron footwork shattering stone tiles',
      'subtle clothing fabric flutter on internal power release',
      'atmospheric rain droplets atomized by kinetic shockwaves',
    ],
    fullActionBiblePreset: {
      stuntDesignStyle: 'Grounded Classical Chinese Neijia (Xingyi, Bagua, Wing Chun) without wirework floatiness; historical realism.',
      combatPhysics: 'Kinetic energy transferred through kinetic skeletal alignment; Fa-Jin internal shockwave dissipation.',
      weaponDynamics: 'Short blades (Ba Zan Dao, Deer Horn Knives) against long poles; blade-sliding friction with zero theatrical twirling.',
      cameraChoreography: 'Disciplined classical tableau framing (Ozu/Kurosawa influence), extreme close-ups on precise foot pivots.',
      impactVelocity: 'Glacial contemplative pre-fight stillness broken by single-frame bone-crushing concussive releases.',
      spatialDestruction: 'Flagstone tiles cracking under foot pivots, standing water rings vibrating from kinetic shockwaves.',
      safetyAndContinuity: 'Historical wardrobe weave integrity, authentic linen fraying and subtle internal bleeding indications.',
    },
  },
  {
    id: 'skill-tactical-parkour',
    name: '战术跑酷翻滚与环境位移接招',
    nameEn: 'Tactical Parkour & Architectural Evasive Combat',
    category: 'TACTICAL_PARKOUR',
    tagline: '立体维度的城市逃生与攻防转换：掩体金刚跃、墙面蹬踏反折与跑动中卸力连击。',
    origin: 'David Belle / Cyril Raffaelli (《暴力街区》/《007：大战皇家赌场》)',
    corePhilosophy:
      '将建筑环境（楼梯栏杆、废弃集装箱、通风管道、狭长防火梯）作为身体动量的加速器。在高速逃亡与追逐中，利用重力和离心力将防守动作转化为致命打击，借助障碍物完成翻滚卸力，并在空中完成武器重整与反击。',
    signatureCombos: [
      '【金刚跳过障碍接扫堂腿】高速冲刺中双手撑桌面金刚跳（Kong Vault）越过掩体，空中借力双脚飞蹬追兵胸口，落地顺势低身扫堂腿绊倒第二人。',
      '【垂直蹬墙折返下砸肘】遭死胡同夹击时，三步蹬上垂直墙壁借反弹力后空翻越过敌人头顶，下坠重力加速度将肘尖狠狠砸在其锁骨上。',
      '【滑行过低矮横梁穿心踢】在铁丝网缺口前俯身滑铲，滑行过程中拔刀削断追兵脚踝，钻过缺口后翻身撑地单腿倒踢其面门。',
    ],
    impactRhythm:
      '行云流水的动量冲刺（持续高心率）→ 借力腾空瞬间的优美滞空感 → 落地翻滚顺带杀伐的干脆利落。',
    cameraChoreo:
      '斯坦尼康操作员与跑酷特技演员同步冲刺穿梭于狭小空间，跟随镜头（Tracking Shot）做穿栏杆无缝切换，镜头充满狂暴的动量速度感。',
    spatialDestruction:
      '铁丝网被撕开大洞、木箱被飞跃蹬踏踩碎、屋顶瓦片飞溅脱落、落水管被拉扯断裂喷涌积水。',
    promptKeywords: [
      'tactical parkour dynamic combat momentum',
      'Kong vault over industrial obstacles into brutal slide attack',
      'wall-run rebound takedown mechanics',
      'continuous moving Steadicam tracking actor through urban maze',
      'gravity and momentum weaponization',
      'splintering wooden crates and rain-slicked fire escapes',
    ],
    fullActionBiblePreset: {
      stuntDesignStyle: 'Urban Tactical Parkour fluid movement blended with brutal hand-to-hand neutralization on the run.',
      combatPhysics: 'Centrifugal momentum redirection, kinetic energy preservation across vaults and rolls, gravity-assisted impact force.',
      weaponDynamics: 'Holstered weapon retention during full-body flips; quick-draw strikes in mid-air trajectory.',
      cameraChoreography: 'Continuous unbroken Steadicam tracking alongside actor momentum, sweeping vertical crane transitions.',
      impactVelocity: 'Relentless forward speed punctuated by split-second architectural redirects and crushing downward momentum blows.',
      spatialDestruction: 'Corrugated roof tiles crumbling under foot landings, chainlink fences collapsing, dust plumes on roll recovery.',
      safetyAndContinuity: 'Scuff patterns on shoe soles, mud and gravel coating back of tactical jacket from concrete slides.',
    },
  },
];

export function getActionSkillById(id: string): ActionSkill | undefined {
  return ACTION_SKILLS_LIBRARY.find((s) => s.id === id);
}

export function getActionSkillsByCategory(category: ActionSkill['category']): ActionSkill[] {
  return ACTION_SKILLS_LIBRARY.filter((s) => s.category === category);
}

export function applySkillToActionBible(actionBible: ActionBible, skill: ActionSkill): ActionBible {
  const currentSkills = actionBible.selectedSkills || [];
  const updatedSkills = currentSkills.includes(skill.id) ? currentSkills : [...currentSkills, skill.id];
  const preset = skill.fullActionBiblePreset;

  return {
    ...actionBible,
    stuntDesignStyle: preset.stuntDesignStyle || actionBible.stuntDesignStyle,
    combatPhysics: preset.combatPhysics || actionBible.combatPhysics,
    weaponDynamics: preset.weaponDynamics || actionBible.weaponDynamics,
    cameraChoreography: preset.cameraChoreography || actionBible.cameraChoreography,
    impactVelocity: preset.impactVelocity || actionBible.impactVelocity,
    spatialDestruction: preset.spatialDestruction || actionBible.spatialDestruction,
    safetyAndContinuity: preset.safetyAndContinuity || actionBible.safetyAndContinuity,
    selectedSkills: updatedSkills,
    stuntCombos: [...(actionBible.stuntCombos || []), ...skill.signatureCombos],
    updatedAt: new Date().toISOString(),
  };
}

export function getActionSkillsPromptModifiers(skillIds: string[] = []): string {
  if (!skillIds || skillIds.length === 0) return '';
  const skills = skillIds.map((id) => getActionSkillById(id)).filter(Boolean) as ActionSkill[];
  if (skills.length === 0) return '';

  const keywords = Array.from(new Set(skills.flatMap((s) => s.promptKeywords))).slice(0, 8);
  return keywords.join(', ');
}
