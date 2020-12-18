// デバッグとか用。
function mySleep(ms: number, id: number, s: string): Promise<number> {
  return new Promise<number>((resolve) => {
    setTimeout(() => {
      console.log(id + " : " + s);
      resolve(id);
    }, ms);
  });
}

// アップロード制御用マネージャークラス。
// 疑似シングルトン : アップロード処理中は一つだけ存在するが、処理が終わったら不要なインスタンスになるので破棄できるようなクラス。
class UploadManager {
  private static instance: UploadManager; // 自身。シングルトンなのでこれが重要。

  private maxParallelNum: number = 0; // なんパラレルでのアップロードが可能か、最大アップロード可能パラレル件数。

  private uploadGroup: Item[][] = [];   // アップロード対象オブジェクト群
  private currentUploadGroupNum: number = 0;    // とりあえずいま現在アップロードしているグループのId。自分で用意しておいてあれだけど、何に使うのだろうか。
  private nowUploadItems: Item[] = [];  // いま現在アップロードしているアイテムの一覧。内部的な検索用のイメージ。「uploadGroup」を全件検索するのもあれだし。

  private uploading: boolean = false;   // アップロード処理中を示すフラグ。

  constructor() {
    // アップロード件数のパラレル可能数などを、APIで取得します。
    try {
      // 当たり前だけどこんなに簡単じゃないわね↓
      this.maxParallelNum = this.getUploadInfo();
    } catch (e) {
      // 1-1. エラー時はアップロードまで辿り着かないってことなので終了でいいです。
      // コンストラクタでエラーのお作法ってあるのか不明。あればそれを採用で。（未調査）C++には定番があるので気にしてます。
    }
  }

  // シングルトンの定番。
  static getInstance() {
    // 定番の。
    if (!UploadManager.instance) {
      UploadManager.instance = new UploadManager();
    }

    return UploadManager.instance;
  }

  // アップロード件数のパラレル可能数などを、APIで取得します。
  private getUploadInfo() {
    // 1. APIで取得して情報返却。
    return 3;
  }

  // アップロード処理を開始しなさいの指示の受け取り口。
  public async uploadStart(): Promise<void> {
    // 多重指示はガード。
    if (this.uploading) {
      return console.log("now uploading...");
    }
    console.log("upload start");
    this.uploading = true;

    // ここをめちゃがんばって工夫すれば、ビジーループのアップロード処理が完成します。
    // ですがちょっとよろしくないので、オブザーバブルに変更します。次の自分の作業で。
    for (let i = 0; i < 5; i++) {}
    await this.uploadGroup[0][0].uploadStart();
    await this.uploadGroup[1][0].uploadStart();

    // キャンセル実験
    this.uploadGroup[1][0].cancel();
    this.uploading = false;
  }

  // アップロード対象の配列を入れる。
  public setUploadGroup(items: Item[]) {
    this.uploadGroup.push(items);
  }
  // デバッグ用。配列内容を出してるだけ。
  public displayUploadGroup() {
    console.log(this.uploadGroup);
  }
}

class Item {
  // キャンセル用フラグ : 外からこれがtrueにされたらアップロード中の各処理中に参照しているので止める。
  private cancelFlag = false;

  // いったんpath（upload対象のディレクトリ）、name（ファイル名）、size（ファイルサイズ）でも。
  constructor(
    private path: string,
    private name: string,
    private size: number
  ) {}

  // 非同期命令受け取り口。アップロード処理を呼び出したら返却します。
  public async uploadStart(): Promise<void> {
    this.doUpload();
  }

  // アイテムごとのアップロードを行う場所。
  public async doUpload() {
    // ダミーで適当にwaitさせてます。本当ならDB操作とかAWSへの問い合わせとかを頑張るところ。

    // GigaCCDB更新

    await mySleep(500, this.size, "GigaCCDB更新");

    if (this.cancelFlag) {
      return console.log(this.size + " : Cancel 1");
    }

    // AWSへ実体をアップロード
    await mySleep(2000, this.size, "AWSへ実体をアップロード");

    if (this.cancelFlag) {
      return console.log(this.size + " : Cancel 2");
    }

    // 完了
    await mySleep(1000, this.size, "完了しまして");
  }

  // キャンセル指示
  public cancel() {
    console.log("cancel指示です。");
    this.cancelFlag = true;
  }
}

// ###### アップロードボタンを押したときの処理みたいな感じです↓

// ###### とはいえまずは準備
let items: Item[] = [
  new Item("/aaa/bbb", "1.jpg", 1),
  new Item("/aaa/bbb", "2.jpg", 2),
  new Item("/aaa/bbb", "3.jpg", 3),
  new Item("/aaa/bbb", "4.jpg", 4),
  new Item("/aaa/bbb", "5.jpg", 5),
  new Item("/aaa/bbb", "6.jpg", 6),
  new Item("/aaa/bbb", "7.jpg", 7),
  new Item("/aaa/bbb", "8.jpg", 8),
];
let uploadManager = UploadManager.getInstance();
uploadManager.setUploadGroup(items);
items = [];
items = [
  new Item("/あああ/いいい", "11.jpg", 11),
  new Item("/あああ/いいい", "22.jpg", 22),
  new Item("/あああ/いいい", "33.jpg", 33),
  new Item("/あああ/いいい", "44.jpg", 44),
  new Item("/あああ/いいい", "55.jpg", 55),
  new Item("/あああ/いいい", "66.jpg", 66),
  new Item("/あああ/いいい", "77.jpg", 77),
  new Item("/あああ/いいい", "88.jpg", 88),
];
uploadManager.setUploadGroup(items);
//uploadManager.displayUploadGroup();

// アップろ開始
uploadManager.uploadStart();
uploadManager.uploadStart();
