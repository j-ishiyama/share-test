// デバッグとか用。指定時間停止(ミリ秒）+idと文字列を吐き出すだけのなんか。WebAPI呼び出し待つののダミーとか。
function mySleep2(ms: number, id: number, s: string): Promise<number> {
  return new Promise<number>((resolve) => {
    setTimeout(() => {
      console.log(id + " : " + s);
      resolve(id);
    }, ms);
  });
}

// ### Observerパターン亜種って感じで採用してます。 ###
// インターフェイス群
interface Subject {
  on(item: Observer): void;
  off(item: Observer): void;
  notify(): void;
  callbackObserver(item: Observer): void;
}
interface Observer {
  upload(): void;
  cancel(): void;
}

// オブザーバー : 通知される側。アップロード通知とかもらうよ。
class Item2 implements Observer {
  // キャンセル用フラグ : 外からこれがtrueにされたらアップロード中の各処理中に参照しているので止める。
  private cancelFlag = false;

  // いったんpath（upload対象のディレクトリ）、name（ファイル名）、size（ファイルサイズ）でも。
  constructor(
    private path: string,
    private name: string,
    private size: number,
    private subject: Subject,
  ) {}

  // インターフェイス実装部
  //  async upload(): Promise<void> {
  upload() {
    this.doUpload();
  }
  // キャンセル指示
  cancel(): void {
    console.log("cancel指示です。");
    this.cancelFlag = true;
  }

  // アイテムごとのアップロードを行う場所。
  public async doUpload() {
    // ダミーで適当にwaitさせてます。本当ならDB操作とかAWSへの問い合わせとかを頑張るところ。

    // GigaCCDB更新

    await mySleep2(500, this.size, "GigaCCDB更新");

    if (this.cancelFlag) {
      return console.log(this.size + " : Cancel 1");
    }

    // AWSへ実体をアップロード
    await mySleep2(2000, this.size, "AWSへ実体をアップロード");

    if (this.cancelFlag) {
      return console.log(this.size + " : Cancel 2");
    }

    // 完了
    await mySleep2(1000, this.size, "完了しまして");
    this.subject.callbackObserver(this);
  }
}

// アップロード制御用マネージャークラス。
// Subject。アップロード対象アイテムに対して通知を飛ばす。対象アイテムの管理までここで行う。
// 疑似シングルトン : アップロード処理中は一つだけ存在するが、処理が終わったら不要なインスタンスになるので破棄できるようなクラス。
class UploadManager2 implements Subject {
  private static instance: UploadManager2; // 自身。シングルトンなのでこれが重要。

  private maxParallelNum: number = 0; // なんパラレルでのアップロードが可能か、最大アップロード可能パラレル件数。

  private uploadGroup: Item2[][] = []; // アップロード対象オブジェクト群
  private observers: Observer[] = []; // いま現在アップロードしているアイテムの一覧。内部的な検索用のイメージ。「uploadGroup」を全件検索するのもあれだし。

  private uploading: boolean = false; // アップロード処理中を示すフラグ。

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

  // 未使用
  on(item: Observer): void {
    this.observers.push(item);
  }
  // あってもいいけど、例えば「ManageItems」みたいなクラスに集約してもいいね。
  off(item: Observer): void {
    console.log("off");
    this.observers.splice(this.observers.indexOf(item), 1);
  }
  notify(): void {
    this.observers.forEach((item: Observer) => item.upload());
  }
  // あってもいいけど、例えば「ManageItems」みたいなクラスに集約してもいいね。
  callbackObserver(item:Observer): void{
      console.log("callback");
      this.off(item);
  }

  // シングルトンの定番。
  static getInstance() {
    // 定番の。
    if (!UploadManager2.instance) {
      UploadManager2.instance = new UploadManager2();
    }

    return UploadManager2.instance;
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
    this.manageNotifyItems();

    // 通知
    this.notify();

    this.uploading = false;
    console.log("upload end");
  }

  // ここをうまいこと、アップロード対象全件（uploadGroup[][]）から通知用アイテム群（observers）に管理することが肝になります。
  private manageNotifyItems(): void {
    this.on(this.uploadGroup[0][1]);
    this.on(this.uploadGroup[0][2]);
    this.on(this.uploadGroup[0][3]);
    this.on(this.uploadGroup[1][0]);
  }

  // アップロード対象の配列を入れる。
  public setUploadGroup(items: Item2[]) {
    this.uploadGroup.push(items);
  }
  // デバッグ用。配列内容を出してるだけ。
  public displayUploadGroup() {
    console.log(this.uploadGroup);
  }

  // キャンセルテスト。動いているやつだけを対象にキャンセルするからALLとかじゃないけど、まぁテスト。
  public uploadCancelAll() {
    this.observers.forEach((item: Observer) => item.cancel());
  }

  public aaa() {
      console.log("aaa");
  }
}

// ###### アップロードボタンを押したときの処理みたいな感じです↓

// ###### とはいえまずは準備
let uploadManager2 = UploadManager2.getInstance();
let items2: Item2[] = [
    new Item2("/aaa/bbb", "1.jpg", 1, uploadManager2),
    new Item2("/aaa/bbb", "2.jpg", 2, uploadManager2),
    new Item2("/aaa/bbb", "3.jpg", 3, uploadManager2),
    new Item2("/aaa/bbb", "4.jpg", 4, uploadManager2),
    new Item2("/aaa/bbb", "5.jpg", 5, uploadManager2),
    new Item2("/aaa/bbb", "6.jpg", 6, uploadManager2),
    new Item2("/aaa/bbb", "7.jpg", 7, uploadManager2),
    new Item2("/aaa/bbb", "8.jpg", 8, uploadManager2),
  ];
  uploadManager2.setUploadGroup(items2);
items2 = [];
items2 = [
  new Item2("/あああ/いいい", "11.jpg", 11, uploadManager2),
  new Item2("/あああ/いいい", "22.jpg", 22, uploadManager2),
  new Item2("/あああ/いいい", "33.jpg", 33, uploadManager2),
  new Item2("/あああ/いいい", "44.jpg", 44, uploadManager2),
  new Item2("/あああ/いいい", "55.jpg", 55, uploadManager2),
  new Item2("/あああ/いいい", "66.jpg", 66, uploadManager2),
  new Item2("/あああ/いいい", "77.jpg", 77, uploadManager2),
  new Item2("/あああ/いいい", "88.jpg", 88, uploadManager2),
];
uploadManager2.setUploadGroup(items2);
//uploadManager.displayUploadGroup();

// アップろ開始
uploadManager2.uploadStart();
uploadManager2.uploadStart();
//uploadManager2.uploadCancelAll();
