import operatorCsvJson from '../data/operatorsCsv.json'

export default class OperatorJsonParser{

    private static getTags(obj: Record<string,string | undefined>){
        const removedObj = obj
        const rare = Number( obj['★']?.replace('★',''))
        const type = removedObj.タイプ
        delete removedObj.名前
        delete removedObj['★']
        delete removedObj.タイプ
        delete removedObj.追加日
        const tags = [type, ...Object.entries(removedObj).map(([key, value]) => {
            if (value !== '') return key
            return null
        }).filter(Boolean)]
        if (rare === 5) {
            return [...tags, 'エリート']
        }
        return tags
    }

    static perseToDataJson(){
        return operatorCsvJson.map(o => {
            return {
                name: o.名前,
                rare: Number( o['★']?.replace('★','')) ?? 3,
                tags: this.getTags(o) as string[]
            }
        })
    }
}