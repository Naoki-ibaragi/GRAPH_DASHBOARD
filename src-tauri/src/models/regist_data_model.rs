pub enum UnitData{
    Arm1(Arm1Info),
    Arm2(Arm2Info),
    Test(TestInfo),
    IP(IPTestInfo),
    LD(LDInfo),
    PreHeat(PreHeatInfo),
    PocketInsp(PocketInspInfo),
    ChipInsp(ChipInspInfo),
}

//上流アームの状態を入れる構造体
pub struct Arm1Info{
    pub PF:String,
    pub LotName:String,
    pub Serial:String,
    pub Count:String
}

impl Arm1Info{
    pub fn new(pf:&str,lot_name:&str,serial:&str,count:&str)->Self{
        Arm1Info { PF: pf.to_string(), LotName: lot_name.to_string(), Serial: serial.to_string(), Count: count.to_string() }
    }
}

//下流アームの状態を入れる構造体
pub struct Arm2Info{
    pub PF:String,
    pub LotName:String,
    pub Serial:String,
    pub Count:String
}

impl Arm2Info{
    pub fn new(pf:&str,lot_name:&str,serial:&str,count:&str)->Self{
        Arm2Info { PF: pf.to_string(), LotName: lot_name.to_string(), Serial: serial.to_string(), Count: count.to_string() }
    }
}

//ステージ関係の状態を入れる構造体
pub struct TestInfo{
    pub PF:String,
    pub LotName:String,
    pub Serial:String,
    pub StageSerial:String,
    pub StageCount:String,
    pub ProbeSerial:String,
    pub ProbeCount:String,
    pub ProbeAlign1X:String,
    pub ProbeAlign1Y:String,
    pub ProbeAlign2X:String,
    pub ProbeAlign2Y:String,
    pub ChipAlignX:String,
    pub ChipAlignY:String,
    pub ChipAlignT:String,
}

impl TestInfo{ //コンストラクタのみ定義
    pub fn new(
        pf:&str,
        lot_name:&str,
        serial:&str,
        stage_serial:&str,
        stage_count:&str,
        probe_serial:&str,
        probe_count:&str,
        probe_align_1x:&str,
        probe_align_1y:&str,
        probe_align_2x:&str,
        probe_align_2y:&str,
        chip_align_x:&str,
        chip_align_y:&str,
        chip_align_t:&str,
    )->Self{
        TestInfo { 
            PF: pf.to_string(), 
            LotName: lot_name.to_string(), 
            Serial: serial.to_string(), 
            StageSerial: stage_serial.to_string(), 
            StageCount: stage_count.to_string(), 
            ProbeSerial: probe_serial.to_string(), 
            ProbeCount: probe_count.to_string(), 
            ProbeAlign1X: probe_align_1x.to_string(), 
            ProbeAlign1Y: probe_align_1y.to_string(), 
            ProbeAlign2X: probe_align_2x.to_string(), 
            ProbeAlign2Y: probe_align_2y.to_string(), 
            ChipAlignX: chip_align_x.to_string(), 
            ChipAlignY: chip_align_y.to_string(), 
            ChipAlignT: chip_align_t.to_string(),
        }
    }
}

//予熱テーブル関係の情報を入れる構造体
pub struct PreHeatInfo{
    pub PF:String,
    pub LotName:String,
    pub Serial:String,
    pub AlignX:String,
    pub AlignY:String,
    pub AlignT:String,
}

impl PreHeatInfo{ //コンストラクタのみ定義
    pub fn new(pf:&str,lot_name:&str,serial:&str,align_x:&str,align_y:&str,align_t:&str)->Self{
        PreHeatInfo { PF: pf.to_string(), LotName: lot_name.to_string(), Serial: serial.to_string(), AlignX: align_x.to_string(), AlignY: align_y.to_string(), AlignT: align_t.to_string() }
    }
}

//LDテーブル関係の情報を入れる構造体
pub struct LDInfo{
    pub PF:String,
    pub LotName:String,
    pub Serial:String,
    pub TrayArm:String, //oku or temae
    pub PocketX:String,
    pub PocketY:String,
    pub PocketAlignX:String,
    pub PocketAlignY:String
}

impl LDInfo{ //コンストラクタのみ定義
    pub fn new( 
        pf:&str,
        lot_name:&str,
        serial:&str,
        tray_arm:&str,
        pocket_x:&str,
        pocket_y:&str,
        pocket_align_x:&str,
        pocket_align_y:&str
    )->Self{
        LDInfo { 
            PF: pf.to_string(), 
            LotName: lot_name.to_string(), 
            Serial: serial.to_string(), 
            TrayArm: tray_arm.to_string(), 
            PocketX: pocket_x.to_string(), 
            PocketY: pocket_y.to_string(), 
            PocketAlignX: pocket_align_x.to_string(), 
            PocketAlignY: pocket_align_y.to_string()
        }
    }
}

//外観検査ステージ関係の状態を入れる構造体
pub struct IPTestInfo{
    pub PF:String,
    pub LotName:String,
    pub Serial:String,
    pub StageCount:String,
}

impl IPTestInfo{ //コンストラクタのみ定義
    pub fn new(
        pf:&str,
        lot_name:&str,
        serial:&str,
        stage_count:&str,
    )->Self{
        IPTestInfo { 
            PF: pf.to_string(), 
            LotName: lot_name.to_string(), 
            Serial: serial.to_string(), 
            StageCount: stage_count.to_string(), 
        }
    }
}

//ULDのポケットアライメントの情報を入れる構造体
pub struct PocketInspInfo{
    pub PF:String,
    pub LotName:String,
    pub Serial:String,
    pub PocketX:String,
    pub PocketY:String,
    pub AlignX:String,
    pub AlignY:String,
}

impl PocketInspInfo{ //コンストラクタのみ定義
    pub fn new(pf:&str,lot_name:&str,serial:&str,pocket_x:&str,pocket_y:&str,align_x:&str,align_y:&str)->Self
    {
        PocketInspInfo { 
            PF: pf.to_string(), 
            LotName: lot_name.to_string(), 
            Serial: serial.to_string(), 
            PocketX: pocket_x.to_string(), 
            PocketY: pocket_y.to_string(), 
            AlignX: align_x.to_string(), 
            AlignY: align_y.to_string(),
        }
    }
}

//挿入後チップ認識の情報を入れる構造体
pub struct ChipInspInfo{
    pub PF:String,
    pub LotName:String,
    pub Serial:String,
    pub PocketX:String,
    pub PocketY:String,
    pub AlignX:String,
    pub AlignY:String,
}

impl ChipInspInfo{ //コンストラクタのみ定義
    pub fn new(pf:&str,lot_name:&str,serial:&str,pocket_x:&str,pocket_y:&str,align_x:&str,align_y:&str)->Self
    {
        ChipInspInfo { 
            PF: pf.to_string(), 
            LotName: lot_name.to_string(), 
            Serial: serial.to_string(), 
            PocketX: pocket_x.to_string(), 
            PocketY: pocket_y.to_string(), 
            AlignX: align_x.to_string(), 
            AlignY: align_y.to_string(),
        }
    }
}

