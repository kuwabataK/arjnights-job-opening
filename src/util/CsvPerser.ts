import operatorCsvJson from '../data/operatorsCsv.json'

export default class CsvPerser{

    private static getTags(obj: Record<string,string>){
        const removedObj = obj
        delete removedObj.名前
        delete removedObj['★']
        delete removedObj.タイプ
        delete removedObj.追加日
        return Object.entries(removedObj).map(([key, value]) => {
            if (value !== '') return key
            return null
        }).filter(Boolean)
    }

    static perseToDataJson(){
        return operatorCsvJson.map(o => {
            return {
                name: o.名前,
                rare: Number( o['★']?.replace('★','')),
                tags: this.getTags(o) as string[]
            }
        })
    }
}