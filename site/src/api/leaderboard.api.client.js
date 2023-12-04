import { useQuery } from '@tanstack/react-query';

import React, { useState } from 'react';
import { client } from './client';
import { totalPoints } from '../../utils/helpers';
import { bronze, gold, silver } from '../assets/images/medals';
import Avatar from '../reusecore/Avatar';
import { MemberContainer, RankContainer } from '../reusecore/Table';

export const useFetchLeaderBoard = () => {
  const fetchLeaderBoard = async (period, name) => {
    const _name = name !== '' ? `&name=${name}` : null;
    try {
      const response = await client.get(
        `directory_items.json/?order=likes_received&period=${
          period || 'monthly'
        }&${_name}`
      );
      return response?.data;
    } catch (error) {
      throw error;
    }
  };

  const [period, setPeriod] = useState('monthly');
  const [name, setName] = useState('');
  const leadColumns = React.useMemo(
    () => [
      {
        header: 'Rank',
        accessorKey: '',
        cell: info => {
          const value = info?.row?.index + 1;
          const rank = ['', gold, silver, bronze];
          return (
            <RankContainer>
              {[1, 2, 3].includes(value) ? (
                <img src={rank[value]} alt={'Rank'} />
              ) : (
                <p>{value}</p>
              )}
            </RankContainer>
          );
        },
      },
      {
        header: 'Member',
        accessorKey: 'avatar',
        accessorFn: row => row?.user?.name,
        cell: info => {
          const { user } = info?.row?.original;
          const avatarUrl = user.avatar_template
            .replace('{size}', '50')
            .replace('{username}', user.username);
          return (
            <MemberContainer>
              <div className="avatar">
                <Avatar
                  src={`https://discuss.layer5.io/${avatarUrl}`}
                  alt={user?.name}
                />
              </div>
              <div className="username">
                <p>{user?.name}</p>
              </div>
            </MemberContainer>
          );
        },
      },
      {
        header: 'Likes',
        accessorKey: 'likes_received',
        cell: info => info?.getValue(),
      },
      {
        header: 'Visits',
        accessorKey: 'days_visited',
        cell: info => info?.getValue(),
      },
      {
        header: 'Posts',
        accessorKey: 'post_count',
        cell: info => info?.getValue(),
      },
      {
        header: 'Solutions Accepted',
        accessorKey: 'solutions',
        cell: info => info?.getValue(),
      },
      {
        header: 'Total Points',
        accessorKey: 'points',
        cell: info => {
          const { likes_received, post_count, solutions } = info?.row?.original;
          return (
            <span>{totalPoints(post_count, likes_received, solutions)}</span>
          );
        },
      },
    ],
    []
  );

  const { data: leaderBoard, isFetching: loadingLeaderBoard } = useQuery({
    queryKey: ['leader-board', period, name],
    queryFn: () => fetchLeaderBoard(period, name),
    onError: () => {
      //  TODO: implement alerts for errors
    },
  });
  return {
    leaderBoard,
    loadingLeaderBoard,
    leadColumns,
    period,
    setPeriod,
    setName,
  };
};
