import _ from 'lodash'
import OperatorJsonParser from '../util/OperatorJsonParser';
import { useEffect, useState } from 'react';

const getAllSubsets =
    (theArray: string[]) => theArray.reduce(
        (subsets, value) => subsets.concat(
            subsets.map(set => [value, ...set])
        ),
        [[]] as string[][]
    );

type Ope = {
    name: string;
    rare: number;
    tags: string[];
}

export default function useCalcOperator() {

    const [operators, setOpe] = useState<Ope[]>([])


    useEffect(() => {
        const ope = OperatorJsonParser.perseToDataJson().filter(Boolean)
        if (ope.every(o => o.name)){
            setOpe(ope)
        }
    },[])

    const _getAvailableOperators = (tagNames: string[]) => {
        const opes = operators.filter(ope => tagNames.every(id => ope.tags.includes(id)))
        // ★6は上級エリートを必須にする
        return tagNames.includes('上級エリート') ? opes : opes.filter(ope => ope.rare !== 6)
    }

    const getAllTagSets = (tagNames: string[]) => {
        const powerSet = getAllSubsets(tagNames)
        return [...new Set(powerSet)]
    }

    const getAvailableOperators = (tagNames: string[]) => {
        const tagSets = getAllTagSets(tagNames)
        const result = tagSets.map((tags) => {
            const _operators = _getAvailableOperators(tags)
            const rares = _operators.map(ope => ope.rare === 1 ? null : ope.rare).filter(Boolean) as number[] // 星１は外す
            const fixedRares = rares.length !== 0 ? rares : [1]
            const rare = Math.min(...fixedRares)
            return {
                tagName: tags.reduce((acc, cur, index) => {
                    if (index === 0) {
                        return cur
                    }
                    return `${acc}+${cur}`
                }, ""),
                operators: _operators,
                rare
            }
        }).filter(r => r.operators.length !== 0)
        return _.uniqBy(result, 'tagName').sort((a,b) => b.rare - a.rare)
    }

    return {
        getAvailableOperators
    }
}