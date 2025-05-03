import { Card, CardContent, Chip, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableRow, Paper, Button, Box, useTheme, useMediaQuery } from '@mui/material';
import tags from '../data/tags.json';
import { useState } from 'react';
import useCalcOperator from '../hook/useCalcOperator';
import OCR from '../util/OCR';
import usePasteImage from '../hook/usePasteImage';

function SelectTags() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const { getAvailableOperators } = useCalcOperator();
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

    const [chipColor] = useState<Record<number, Object>>({
        1: { borderColor: 'orange' },
        2: { borderColor: 'black' },
        3: { borderColor: 'black' },
        4: { borderColor: 'blue' },
        5: { borderColor: 'red' },
        6: { borderColor: 'purple' },
    });

    const isSelected = (name: string) => selectedTagIds.includes(name);

    const toggleTag = (name: string) => {
        if (isSelected(name)) {
            setSelectedTagIds(selectedTagIds.filter(_name => _name !== name));
        } else if (selectedTagIds.length < 5) {
            setSelectedTagIds([name, ...selectedTagIds]);
        }
    };

    const resetTags = () => {
        setSelectedTagIds([]);
    };

    const resultOperators = getAvailableOperators(selectedTagIds);

    const getRareColor = (rare: number) => {
        const rareColors: Record<number, string> = {
            1: 'orange',
            2: 'black',
            3: 'black',
            4: 'blue',
            5: 'red',
            6: 'purple',
        };
        return rareColors[rare];
    };

    const recognaizeTagFromClipboadImage = async (imageFile:File) => {
        const detectedTags = await OCR.recognizeImageAndTag(imageFile);
        setSelectedTagIds(detectedTags);
    }

    const {loadClipBoardImage} = usePasteImage({callback: recognaizeTagFromClipboadImage})

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            console.log(file);
            await recognaizeTagFromClipboadImage(file);
        }
        // clear the file input
        event.target.value = '';
    };

    const resultComponent = (result: typeof resultOperators) => {
        return (
            <>
                {result.map((r) => {

                    if (!r.tagName) return

                    return (
                        <Card sx={{ minWidth: 275, maxWidth: 800, margin: '0 auto' }} key={r.tagName}>
                            <CardContent>
                                <Typography sx={{ fontSize: 14, fontWeight: 'bold' }} color="text.secondary" gutterBottom>
                                    {r.tagName}
                                </Typography>
                                <Typography sx={{ fontSize: 14 }}
                                    color={getRareColor(r.rare)}
                                    gutterBottom>
                                    {'★' + r.rare}
                                </Typography>
                                <Typography variant="h5" component="div">
                                    {r.operators.map((ope) => {
                                        return <Chip label={ope.name} style={chipColor[ope.rare] as any}
                                            variant='outlined'
                                            key={ope.name}
                                        />
                                    })}
                                </Typography>
                            </CardContent>
                        </Card>
                    )
                })}
            </>
        )
    }

    const groupedTags = tags.reduce((acc, tag) => {
        if (!acc[tag.category]) {
            acc[tag.category] = [];
        }
        acc[tag.category].push(tag);
        return acc;
    }, {} as Record<string, typeof tags>);

    return (
        <Box sx={{ width: '100%', px: { xs: 1, sm: 2, md: 3 } }}>
            <TableContainer component={Paper} sx={{ maxWidth: 800, width: '100%', margin: '0 auto' }}>
                <Table size={isMobile ? "small" : "medium"}>
                    <TableBody>
                        {Object.entries(groupedTags).map(([category, tags]) => (
                            <TableRow key={category}>
                                <TableCell sx={{ width: isMobile ? '30%' : '20%' }}>
                                    <Typography variant={isMobile ? "subtitle1" : "h6"}>{category}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Grid container spacing={isMobile ? 0.5 : 1}>
                                        {tags.map(tag => (
                                            <Grid item key={tag.name} sx={{ mb: isMobile ? 0.5 : 1 }}>
                                                <Chip
                                                    label={tag.name}
                                                    color="success"
                                                    variant={isSelected(tag.name) ? 'filled' : 'outlined'}
                                                    onClick={() => toggleTag(tag.name)}
                                                    size={isMobile ? "small" : "medium"}
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            
            <Box sx={{ maxWidth: 800, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={resetTags} 
                    fullWidth
                    size={isMobile ? "medium" : "large"}
                >
                    リセット
                </Button>
                
                <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={loadClipBoardImage} 
                    fullWidth
                    size={isMobile ? "medium" : "large"}
                >
                    公開求人の画像をペーストして解析する(BETA)
                </Button>
                
                <Button 
                    variant="contained" 
                    component="label" 
                    fullWidth
                    size={isMobile ? "medium" : "large"}
                >
                    公開求人の画像をアップロードして解析する(BETA)
                    <input type="file" accept="image/*" hidden onChange={handleFileUpload} />
                </Button>
            </Box>
            
            <Box sx={{ maxWidth: 800, width: '100%', margin: '0 auto', mt: 2 }}>
                {resultComponent(resultOperators)}
            </Box>
        </Box>
    );
}

export default SelectTags;