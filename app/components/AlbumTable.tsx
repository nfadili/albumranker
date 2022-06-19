import { useCallback, useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Table, createStyles, Button, ActionIcon } from '@mantine/core';
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
import type { UserSpotifyAlbum } from '~/spotify/client.server';

// Must be called if using SSR
resetServerContext();

const useStyles = createStyles((theme) => ({
    cell: {
        width: '50%'
    },
    dragging: {
        display: 'table',
        background: theme.colors.gray[0]
    }
}));

interface IProps {
    data: UserSpotifyAlbum[];
    onChange: (albums: UserSpotifyAlbum[]) => void;
}

export const AlbumTable = forwardRef(({ data, onChange }: IProps, parentRef) => {
    const [albums, setAlbums] = useState(data);

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

            // Notify parent
            onChange(items);
        },
        [setAlbums, albums]
    );

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Table sx={{ tableLayout: 'auto' }}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Artist</th>
                        <th>Release Date</th>
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
    provided
}: {
    album: UserSpotifyAlbum;
    provided: DraggableProvided;
    snapshot: DraggableStateSnapshot;
}) {
    const { classes } = useStyles();

    return (
        <tr
            className={snapshot.isDragging ? classes.dragging : undefined}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
        >
            <td className={classes.cell}>{album.name}</td>
            <td className={classes.cell}>{album.artist}</td>
            <td className={classes.cell}>{album.releaseDate}</td>
        </tr>
    );
}

function reorder(list: UserSpotifyAlbum[], startIndex: number, endIndex: number) {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
}
