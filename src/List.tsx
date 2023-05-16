import React from 'react';
import { Box, List as MuiList, Card, CardContent, ListSubheader } from '@mui/material';
import {
  Droppable,
  Draggable,
  type DraggableProvided,
  type DraggableStateSnapshot,
  type DraggableRubric,
} from 'react-beautiful-dnd';
import { FixedSizeList, areEqual } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import Item from './Item';
import { Playlist, PlaylistItem } from './Dashboard';

const getRenderItem =
  (items: PlaylistItem[]) => (provided: DraggableProvided, snapshot: DraggableStateSnapshot, rubric: DraggableRubric) =>
    (
      <Item
        innerRef={provided.innerRef}
        provided={provided}
        name={items[rubric.source.index].title}
        thumbnail={items[rubric.source.index].thumbnail}
        channel={items[rubric.source.index].channel}
        position={items[rubric.source.index].position}
        playlistId={items[rubric.source.index].playlistId}
        isDragging={snapshot.isDragging}
      />
    );

type RowProps = {
  data: {
    playlistsItem: Playlist;
    handlePlaylistAt: (newPlaylist: Playlist, index: number) => void;
  };
  index: number;
  style: Object;
};

const Row = React.memo(({ data: { playlistsItem, handlePlaylistAt }, index, style }: RowProps) => {
  const playlistItem = playlistsItem.items[index];
  const renderItem = getRenderItem(playlistsItem.items);

  return (
    <Box sx={style} key={index + playlistItem.id} onClick={() => handlePlaylistAt(playlistsItem, index)}>
      <Draggable draggableId={index + playlistItem.id} index={index} key={index + playlistItem.id}>
        {renderItem}
      </Draggable>
    </Box>
  );
}, areEqual);

type ListProps = {
  playlistsItem: Playlist;
  index: number;
  handlePlaylist: (newPlaylist?: Playlist) => void;
  handlePlaylistAt: (newPlaylist: Playlist, index: number) => void;
};

export default function List(props: ListProps) {
  const { playlistsItem, index, handlePlaylist, handlePlaylistAt } = props;
  const renderItem = getRenderItem(playlistsItem.items);

  return (
    <Card variant="outlined" sx={{ minHeight: '17rem', maxHeight: '100%', width: '25%' }}>
      <CardContent sx={{ p: 1, height: '100%' }}>
        <MuiList
          subheader={
            <ListSubheader
              onClick={() => handlePlaylist(playlistsItem)}
              sx={{ borderBottom: 'solid 1px rgba(255, 255, 255, 0.12)' }}
            >
              {playlistsItem.title}
            </ListSubheader>
          }
          sx={{ height: '100%' }}
        >
          <Droppable droppableId={index.toString()} renderClone={renderItem} mode="virtual">
            {(provided) => (
              <AutoSizer>
                {({ height, width }) => (
                  <FixedSizeList
                    height={height ?? 0}
                    itemCount={playlistsItem.items.length}
                    itemSize={48.48}
                    width={width ?? 0}
                    outerRef={provided.innerRef}
                    itemData={{ playlistsItem, handlePlaylistAt }}
                  >
                    {Row}
                  </FixedSizeList>
                )}
              </AutoSizer>
            )}
          </Droppable>
        </MuiList>
      </CardContent>
    </Card>
  );
}
