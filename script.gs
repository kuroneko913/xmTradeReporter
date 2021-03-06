function main() {
  csv = XMTradeHistoriesMail2Csv()
  if (csv === undefined) {
    Logger.log('対象なし')
    return
  }
  Logger.log(csv)
  csvPutS3(csv)
}

function csvPutS3(csv) {
  let props = PropertiesService.getScriptProperties()
  let accessKey = props.getProperty('AWS_ACCESS_KEY_ID')
  let secretKey = props.getProperty('AWS_SECRET_ACCESS_KEY')
  let bucketName = props.getProperty('S3_BUCKET_NAME')
  let csvFileName = 'histories.csv'
  // バイナリに変換
  let blob = Utilities.newBlob(csv)
  let s3 = S3.getInstance(accessKey, secretKey)
  s3.putObject(bucketName, csvFileName, blob, {logRequests:true})
}

function XMTradeHistoriesMail2Csv() {
  mail_one = getMailOne()
  if (mail_one === undefined)return; 
  let parsed_html = Parser.data(mail_one.body).from('<tr align=right>').to('</tr>').iterate()
  let parsed_html_bgcolor = Parser.data(mail_one.body).from('<tr bgcolor=#E0E0E0 align=right>').to('</tr>').iterate()
  let parsed_html_rows = (parsed_html+','+parsed_html_bgcolor).split(',')
  result_json = []
  for(let i=0; i<parsed_html_rows.length;i++) {
    trades = new XMTrades(parsed_html_rows[i]);
    trades.parse()
    trades_json = trades.get()
    if (trades_json !== undefined) result_json.push(trades_json)
  }
  ordered_keys = [
    'Ticket','Open Time','Type','Size','Item','OpenPrice','S/L','T/P','Close Time','ClosePrice','Commission','Swap','Profit'
  ]
  return json2csv(result_json,ordered_keys)
}

function getMailOne() {
  let threads = GmailApp.search('from:report@xmtrading.com subject:Daily Confirmation is:unread',0,1)
  if (threads.length === 0) return
  let message = threads[0].getMessages()[0]
  threads[0].markRead()
  return {subject:message.getSubject(), body:message.getBody()}
}

function json2csv(json_,ordered_keys) {
  let header_text = ordered_keys.join(',')+'\n'
  let values_text = json_.sort((a,b)=>a.Ticket - b.Ticket).map((row)=> ordered_keys.map((key) => row[key]).join(',')).join('\n')
  return header_text + values_text
}

XMTrades = class {
  constructor(parsed_html_one_row){
    this.one_rows = parsed_html_one_row
    this.trades_keys = [
      'Ticket',
      'Type',
      'Size',
      'Item',
      'OpenPrice',
      'S/L',
      'T/P',
      'ClosePrice',
      'Commission',
      'Swap',
      'Profit',
      'Open Time',
      'Close Time'
    ]
    this.trades = {} 
  }
  parse(){
    let parsed_html = Parser.data(this.one_rows).from('<td>').to('</td>').iterate();
    let parsed_dates = Parser.data(this.one_rows).from('<td nowrap>').to('</td>').iterate();
    let parsed_elements = (parsed_html+','+parsed_dates).split(',')
    if (parsed_elements.length !== this.trades_keys.length) {delete this.trades;return}
    for(let i=0; i<parsed_elements.length; i++) {
      if (this.trades_keys[i].includes('Time')) this.trades[this.trades_keys[i]] = parsed_elements[i].replace('&nbsp;','') 
      else this.trades[this.trades_keys[i]] = parsed_elements[i].replace(' ','')
    }
  }
  get(){
    return this.trades
  } 
}