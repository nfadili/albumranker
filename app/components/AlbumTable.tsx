import { useCallback, useState, useEffect, forwardRef, useMemo } from 'react';
import { Table, createStyles, Checkbox } from '@mantine/core';
import {
    resetServerContext,
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
    DroppableProvided,
    DraggableProvided,
    DraggableStateSnapshot
} from 'react-beautiful-dnd';
import classNames from 'classnames';
import type { UserSpotifyAlbum } from '~/spotify/client.server';
import { findLastIndex } from '~/utils';

// Must be called if using SSR
resetServerContext();

const useStyles = createStyles((theme) => ({
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
}

export const AlbumTable = forwardRef(({ data, onChange }: IProps, parentRef) => {
    const [albums, setAlbums] = useState(data);

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
            <Table sx={{ tableLayout: 'auto' }}>
                <thead>
                    <tr>
                        <th></th>
                        <th>Name</th>
                        <th>Artist</th>
                        <th>Release Date</th>
                        <th>Hide</th>
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
});

function AlbumRow({
    snapshot,
    album,
    provided,
    onHiddenChange
}: {
    album: UserSpotifyAlbum;
    provided: DraggableProvided;
    snapshot: DraggableStateSnapshot;
    onHiddenChange: (id: string, checked: boolean) => void;
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

    return (
        <tr
            className={rowClases}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
        >
            <td>
                <img height={image?.height} width={image?.width} src={image?.url} />
            </td>
            <td className={cellClasses}>{album.name}</td>
            <td className={cellClasses}>{album.artist}</td>
            <td className={cellClasses}>{album.releaseDate}</td>
            <td className={cellClasses}>
                <Checkbox
                    checked={album.isHidden}
                    onChange={(e) => onHiddenChange(album.spotifyId, e.currentTarget.checked)}
                />
            </td>
        </tr>
    );
}

function reorder(list: UserSpotifyAlbum[], startIndex: number, endIndex: number) {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
}
