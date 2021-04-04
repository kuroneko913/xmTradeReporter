# xmTradeReporter
XMでのFX取引履歴のメールから自動で取引CSVを生成し、指定されたS3のBUCKETに保存する。

このリポジトリは、GoogleChromeの拡張である[Google Apps Script GitHub アシスタント](https://chrome.google.com/webstore/detail/google-apps-script-github/lfjcgcmkmjjlieihflfhjopckgpelofo)によって作成、管理されている。

* 旧AppsScriptエディタのスクリプトのプロパティにAWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME をそれぞれ設定して使用する。
* AWSのアカウントは、S3への書き込みのみを許可したUserまたはロールを作成することを前提にしている。
* トリガーを設定し定期実行することを前提に実装している。
* このスクリプトを実行すると、「report@xmtrading.com」から送信される、「Daily Confirmation」というタイトルの最新のメール1件を参照する。
* 参照されたメールは、開封済みになる。

S3への連携は以下のライブラリを用いている。

[Amazon S3 API Binding for Google Apps Script](https://engetc.com/projects/amazon-s3-api-binding-for-google-apps-script/)

Gamilからテーブル構造をパースする処理は、以下のライブラリを用いている。

[Parser](https://script.google.com/d/1Mc8BthYthXx6CoIz90-JiSzSafVnT6U3t0z_W3hLTAX5ek4w0G_EIrNw/edit?usp=drive_web)
