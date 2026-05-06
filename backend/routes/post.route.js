import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import { addComment, addNewPost, bookmarkPost, deletePost, dislikePost, getAllPost, getAllReels, getCommentsOfPost, getTaggedPosts, getUserPost, likePost, getTravelPosts, editPost } from "../controllers/post.controller.js";

const router = express.Router();

router.route("/addpost").post(isAuthenticated, upload.single('file'), addNewPost);
router.route("/all").get(isAuthenticated,getAllPost);
router.route("/reels/all").get(isAuthenticated, getAllReels);
router.route("/userpost/all").get(isAuthenticated, getUserPost);
router.route("/:id/like").get(isAuthenticated, likePost);
router.route("/:id/dislike").get(isAuthenticated, dislikePost);
router.route("/:id/comment").post(isAuthenticated, addComment); 
router.route("/:id/comment/all").post(isAuthenticated, getCommentsOfPost);
router.route("/delete/:id").delete(isAuthenticated, deletePost);
router.route("/edit/:id").put(isAuthenticated, editPost);
router.route("/:id/bookmark").get(isAuthenticated, bookmarkPost);
router.route("/tagged/:userId").get(isAuthenticated, getTaggedPosts);
router.route("/travel/all").get(isAuthenticated, getTravelPosts);

export default router;

