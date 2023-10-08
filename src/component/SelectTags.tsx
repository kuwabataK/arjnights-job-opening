import { Card, CardContent, Chip, Typography } from '@mui/material'
import tags from '../data/tags.json'
import { useState } from 'react'
import useCalcOperator from '../hook/useCalcOperator'

function SelectTags() {

    const { getAvailableOperators } = useCalcOperator()

    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

    const isSelected = (name: string) => {
        return selectedTagIds.includes(name)
    }

    const toggleTag = (name: string) => {
        if (isSelected(name)) {
            setSelectedTagIds(selectedTagIds.filter(_name => _name !== name))
        } else if (selectedTagIds.length < 5) {
            setSelectedTagIds([name, ...selectedTagIds])
        }
    }

    const resultOperators = getAvailableOperators(selectedTagIds)

    const color = (rare: number) => {
        const rareColors: Record<number, string> = {
            3: 'black',
            4: 'blue',
            5: 'red',
            6: 'purple'
        }
        return rareColors[rare] as string
    }

    const resultComponent = (result: typeof resultOperators) => {
        return (
            <>
                {result.map((r) => {
                    return <Card sx={{ minWidth: 275 }} key={r.tagName}>
                        <CardContent>
                            <Typography sx={{ fontSize: 14, fontWeight: 'bold' }} color="text.secondary" gutterBottom>
                                {r.tagName}
                            </Typography>
                            <Typography sx={{ fontSize: 14 }}
                                color={color(r.rare)}
                                gutterBottom>
                                {'★' + r.rare}
                            </Typography>
                            <Typography variant="h5" component="div">
                                {r.operators.map((ope) => {
                                    return <Chip label={ope.name} color="success"
                                        variant='outlined'
                                        key={ope.name}
                                    />
                                })}
                            </Typography>
                        </CardContent>
                    </Card>
                })}
            </>
        )
    }


    return (
        <>
            {tags.map(tag => {
                return <Chip label={tag.name} color="success"
                    variant={isSelected(tag.name) ? 'filled' : 'outlined'}
                    key={tag.name} onClick={() => toggleTag(tag.name)} />
            })}
            {resultComponent(resultOperators)}
        </>
    )
}

export default SelectTags
