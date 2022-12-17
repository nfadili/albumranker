import classNames from 'classnames';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable, resetServerContext } from 'react-beautiful-dnd';
import { findLastIndex } from '~/utils';

import { Anchor, Checkbox, createStyles, Table, Text } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';

import type {
    DropResult,
    DroppableProvided,
    DraggableProvided,
    DraggableStateSnapshot
} from 'react-beautiful-dnd';
import type { UserSpotifyAlbum } from '~/types';

// Must be called if using SSR
resetServerContext();

const useStyles = createStyles((theme) => ({
    table: {
        tableLayout: 'auto',
        '& tbody tr td': {
            padding: 4
        }
    },
    cell: {
        boxSizing: 'border-box'
    },
    draggingCell: {
        width: '50%'
    },
    draggingRow: {
        display: 'table',
        background: theme.colors.gray[3]
    },
    hiddenCell: {
        color: theme.colors.gray[6]
    },
    hiddenRow: {
        background: theme.colors.gray[1]
    }
}));

interface IProps {
    data: UserSpotifyAlbum[];
    onChange: (albums: UserSpotifyAlbum[]) => void;
    disableEdit?: boolean;
}

export const AlbumTable = forwardRef(
    ({ data, onChange, disableEdit = false }: IProps, parentRef) => {
        const { classes } = useStyles();
        const [albums, setAlbums] = useState(data);
        const { width } = useViewportSize();
        const isMobile = width < 500;

        // Whenever table state changes, update the parent
        useEffect(() => {
            onChange(albums);
        }, [albums, onChange]);

        const onDragEnd = useCallback(
            (result: DropResult) => {
                // Dropped outside the list
                if (!result.destination || result.destination.index === result.source.index) {
                    return;
                }

                // No movement
                if (result.destination.index === result.source.index) {
                    return;
                }

                // Save order in local state
                const items = reorder(albums, result.source.index, result.destination.index);
                setAlbums(items);
            },
            [setAlbums, albums]
        );

        const handleHiddenClick = (i: number) => (id: string, hidden: boolean) => {
            // Move newly hidden items to the bottom of the list and newly unhidden items
            // to the top of the hidden items.
            const destinationIndex = hidden
                ? albums.length - 1
                : findLastIndex(albums, (a) => !a.isHidden) + 1;

            const items = reorder(albums, i, destinationIndex);
            items[destinationIndex].isHidden = hidden;
            setAlbums(items);
        };

        return (
            <DragDropContext onDragEnd={onDragEnd}>
                <Table
                    className={classes.table}
                    verticalSpacing='xs'
                    horizontalSpacing='xs'
                    fontSize='xs'
                    captionSide='bottom'
                >
                    <thead>
                        <tr>
                            <th></th>
                            <th>
                                <Text>Name</Text>
                            </th>
                            <th>
                                <Text>Artist</Text>
                            </th>
                            {!isMobile && (
                                <th>
                                    <Text>Release Date</Text>
                                </th>
                            )}
                            {!disableEdit && (
                                <th>
                                    <Text>Hide</Text>
                                </th>
                            )}
                        </tr>
                    </thead>
                    <Droppable droppableId='table'>
                        {(droppableProvided: DroppableProvided) => (
                            <tbody
                                ref={(ref: HTMLElement | null | undefined) => {
                                    droppableProvided.innerRef(ref as HTMLElement);
                                }}
                                {...droppableProvided.droppableProps}
                            >
                                {albums.map((record, index: number) => (
                                    <Draggable
                                        isDragDisabled={disableEdit}
                                        draggableId={record.spotifyId}
                                        index={index}
                                        key={record.spotifyId}
                                    >
                                        {(
                                            provided: DraggableProvided,
                                            snapshot: DraggableStateSnapshot
                                        ) => (
                                            <AlbumRow
                                                provided={provided}
                                                snapshot={snapshot}
                                                album={record}
                                                onHiddenChange={handleHiddenClick(index)}
                                                disableEdit={disableEdit}
                                                isMobile={isMobile}
                                            />
                                        )}
                                    </Draggable>
                                ))}
                                {droppableProvided.placeholder}
                            </tbody>
                        )}
                    </Droppable>
                </Table>
            </DragDropContext>
        );
    }
);
AlbumTable.displayName = 'AlbumTable';

function AlbumRow({
    snapshot,
    album,
    provided,
    onHiddenChange,
    disableEdit,
    isMobile
}: {
    album: UserSpotifyAlbum;
    provided: DraggableProvided;
    snapshot: DraggableStateSnapshot;
    onHiddenChange: (id: string, checked: boolean) => void;
    disableEdit: boolean;
    isMobile: boolean;
}) {
    const { classes } = useStyles();
    const cellClasses = classNames(classes.cell, {
        [classes.draggingCell]: snapshot.isDragging,
        [classes.hiddenCell]: album.isHidden
    });
    const rowClases = classNames({
        [classes.draggingRow]: snapshot.isDragging,
        [classes.hiddenRow]: album.isHidden
    });

    // TODO: Parse image data elsewhere for performance boost
    const images = useMemo(() => JSON.parse(album.images), [album.images]);
    const image = images[2] ?? images[1] ?? images[0];
    const height = (isMobile ? image?.height / 2 : image?.height) ?? 0;
    const width = (isMobile ? image?.width / 2 : image?.width) ?? 0;

    return (
        <tr
            className={rowClases}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
        >
            <td>
                <img height={height} width={width} src={image?.url} alt='' />
            </td>
            <td className={cellClasses}>
                <Anchor href={album.uri ?? '#'}>{album.name}</Anchor>
            </td>
            <td className={cellClasses}>
                <Text>{album.artist}</Text>
            </td>
            {!isMobile && (
                <td className={cellClasses}>
                    <Text>{album.releaseDate}</Text>
                </td>
            )}
            {!disableEdit && (
                <td className={cellClasses}>
                    <Checkbox
                        checked={album.isHidden}
                        onChange={(e) => onHiddenChange(album.spotifyId, e.currentTarget.checked)}
                    />
                </td>
            )}
        </tr>
    );
}

function reorder(list: UserSpotifyAlbum[], startIndex: number, endIndex: number) {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
}
