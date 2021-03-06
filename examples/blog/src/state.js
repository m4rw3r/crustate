/* @flow */

import type { ListResponse, PostResponse } from "./effects";
import type { Model } from "crustate";
import type { StateData } from "crustate/react";

import { updateData } from "crustate";
import { createStateData } from "crustate/react";
import { requestList, requestPost, LIST_RESPONSE, POST_RESPONSE } from "./effects";

export type PostHeading = {
  id: number,
  title: string,
};

export type Post = {
  id: number,
  title: string,
  date: Date,
  author: string,
  body: string,
};

export type PostListDataState = Array<PostHeading> | string | null;

export type PostDataState =
  | {| state: "LOADING", postId: number |}
  | {| state: "LOADED", post: Post |}
  | {| state: "ERROR", error: string |};

export type PostListModel = Model<PostListDataState, {}, ListResponse>;
export type PostModel = Model<PostDataState, { postId: number }, PostResponse>;

export const PostListData: StateData<PostListModel> = createStateData({
  id: "list",
  init: () => updateData(null, requestList()),
  update: (state, msg) => {
    if (!state && msg.tag === LIST_RESPONSE) {
      return updateData(msg.data || msg.error);
    }
  },
});

export const PostData: StateData<PostModel> = createStateData({
  id: "post",
  init: ({ postId }) => updateData({ state: "LOADING", postId }, requestPost(postId)),
  update: (state, msg) => {
    if (state.state === "LOADING" && msg.tag === POST_RESPONSE) {
      if (msg.data) {
        if (msg.data.id === state.postId) {
          return updateData({ state: "LOADED", post: msg.data });
        }
      }
      else {
        return updateData({ state: "ERROR", error: msg.error });
      }
    }
  },
});
