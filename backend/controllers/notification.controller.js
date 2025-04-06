import Notification from "../models/notification.model.js";
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.userId; // Assuming req.user contains the authenticated user's info
        const notifications = await Notification.find({ to: userId })
            .populate({path:"from", select:"username profilePicture"}) // Populate the 'from' field with user details
            .sort({ createdAt: -1 }) // Sort notifications by creation date in descending order
            .limit(10); // Limit to the latest 10 notifications
            await Notification.updateMany({to:userId },{read:true});
        res.status(200).json(notifications); // Send the notifications as a response
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Internal server error" }); // Handle errors
    
    }
}
export const deleteNotifications = async (req, res) => {
    try{
    const userId=req.user.userId; // Assuming req.user contains the authenticated user's info
    await Notification.deleteMany({to:userId});
    res.status(200).json({message:"Deleted all notifications"}); // Send a success message as a response
    }
    catch (error) {
        console.error("Error deleting notifications:", error);
        res.status(500).json({ error: "Internal server error" }); // Handle errors
    }
}
export const deleteNotification= async(req, res)=>{
    try {
        const notificationId=req.params.id; // Assuming the notification ID is passed as a URL parameter
        const userId=req.user.userId; // Assuming req.user contains the authenticated user's info
        const notification=await Notification.findById(notificationId); // Find the notification by ID
        if(!notification) {
            return res.status(404).json({ error: "Notification not found" }); // Handle case where notification is not found
        }
        if(notification.to.toString() !== userId) {
            return res.status(403).json({ error: "You are not authorized to delete this notification" }); // Handle case where user is not authorized to delete the notification
        }
        await Notification.findByIdAndDelete(notificationId); // Delete the notification by ID
        res.status(200).json({message:"Deleted notification"}); // Send a success message as a response
    } catch (error) {
        console.error("Error deleting notification:", error);
        res.status(500).json({ error: "Internal server error" }); // Handle errors
    }
}