-- phpMyAdmin SQL Dump
-- version 4.9.7
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Erstellungszeit: 27. Mrz 2023 um 16:19
-- Server-Version: 10.3.29-MariaDB
-- PHP-Version: 7.4.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `projectillm`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `creator` int(11) NOT NULL,
  `groupid` int(11) NOT NULL,
  `eventname` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `event_announcements`
--

CREATE TABLE `event_announcements` (
  `id` int(11) NOT NULL,
  `eventid` int(11) NOT NULL,
  `text` varchar(255) NOT NULL,
  `date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `event_members`
--

CREATE TABLE `event_members` (
  `id` int(11) NOT NULL,
  `eventid` int(11) NOT NULL,
  `userid` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `event_messages`
--

CREATE TABLE `event_messages` (
  `id` int(11) NOT NULL,
  `userid` int(11) NOT NULL,
  `eventid` int(11) NOT NULL,
  `text` text CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `files`
--

CREATE TABLE `files` (
  `id` int(11) NOT NULL,
  `groupid` int(11) NOT NULL,
  `ownerid` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `groups`
--

CREATE TABLE `groups` (
  `id` int(11) NOT NULL,
  `groupname` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `admin` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `group_invite_keys`
--

CREATE TABLE `group_invite_keys` (
  `id` int(11) NOT NULL,
  `groupid` int(11) NOT NULL,
  `code` varchar(255) NOT NULL,
  `exp_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `group_members`
--

CREATE TABLE `group_members` (
  `id` int(11) NOT NULL,
  `groupid` int(11) NOT NULL,
  `userid` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `group_messages`
--

CREATE TABLE `group_messages` (
  `id` int(11) NOT NULL,
  `userid` int(11) NOT NULL,
  `groupid` int(11) NOT NULL,
  `text` text NOT NULL,
  `date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `list_items`
--

CREATE TABLE `list_items` (
  `id` int(11) NOT NULL,
  `eventid` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `user_bring` varchar(255) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `userid1` int(11) NOT NULL,
  `userid2` int(11) NOT NULL,
  `balance` float NOT NULL,
  `title` varchar(255) NOT NULL,
  `groupid` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `votes`
--

CREATE TABLE `votes` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `eventid` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `vote_options`
--

CREATE TABLE `vote_options` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `voteid` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `vote_user_vote`
--

CREATE TABLE `vote_user_vote` (
  `id` int(11) NOT NULL,
  `userid` int(11) NOT NULL,
  `vote_option` int(11) NOT NULL,
  `voteid` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event-group` (`groupid`),
  ADD KEY `creator-user` (`creator`);

--
-- Indizes für die Tabelle `event_announcements`
--
ALTER TABLE `event_announcements`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `event_members`
--
ALTER TABLE `event_members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `emember-user` (`userid`),
  ADD KEY `member-event` (`eventid`);

--
-- Indizes für die Tabelle `event_messages`
--
ALTER TABLE `event_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `message-user` (`userid`),
  ADD KEY `message-event` (`eventid`);

--
-- Indizes für die Tabelle `files`
--
ALTER TABLE `files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `file-group` (`groupid`),
  ADD KEY `file-owner` (`ownerid`);

--
-- Indizes für die Tabelle `groups`
--
ALTER TABLE `groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admin-user` (`admin`);

--
-- Indizes für die Tabelle `group_invite_keys`
--
ALTER TABLE `group_invite_keys`
  ADD PRIMARY KEY (`id`),
  ADD KEY `key-group` (`groupid`);

--
-- Indizes für die Tabelle `group_members`
--
ALTER TABLE `group_members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `gmember-user` (`userid`),
  ADD KEY `groupmember-group` (`groupid`);

--
-- Indizes für die Tabelle `group_messages`
--
ALTER TABLE `group_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `groupmsg-author` (`userid`),
  ADD KEY `message-group` (`groupid`);

--
-- Indizes für die Tabelle `list_items`
--
ALTER TABLE `list_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `item-event` (`eventid`);

--
-- Indizes für die Tabelle `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user1-id` (`userid1`),
  ADD KEY `user2-id` (`userid2`);

--
-- Indizes für die Tabelle `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indizes für die Tabelle `votes`
--
ALTER TABLE `votes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vote_eventid` (`eventid`);

--
-- Indizes für die Tabelle `vote_options`
--
ALTER TABLE `vote_options`
  ADD PRIMARY KEY (`id`),
  ADD KEY `option_vote` (`voteid`);

--
-- Indizes für die Tabelle `vote_user_vote`
--
ALTER TABLE `vote_user_vote`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user-vote` (`userid`),
  ADD KEY `uservote-vote` (`voteid`),
  ADD KEY `uservote-option` (`vote_option`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `event_announcements`
--
ALTER TABLE `event_announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `event_members`
--
ALTER TABLE `event_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `event_messages`
--
ALTER TABLE `event_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `files`
--
ALTER TABLE `files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `groups`
--
ALTER TABLE `groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `group_invite_keys`
--
ALTER TABLE `group_invite_keys`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `group_members`
--
ALTER TABLE `group_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `group_messages`
--
ALTER TABLE `group_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `list_items`
--
ALTER TABLE `list_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `votes`
--
ALTER TABLE `votes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `vote_options`
--
ALTER TABLE `vote_options`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `vote_user_vote`
--
ALTER TABLE `vote_user_vote`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `creator-user` FOREIGN KEY (`creator`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `event-group` FOREIGN KEY (`groupid`) REFERENCES `groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints der Tabelle `event_members`
--
ALTER TABLE `event_members`
  ADD CONSTRAINT `emember-user` FOREIGN KEY (`userid`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `member-event` FOREIGN KEY (`eventid`) REFERENCES `events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints der Tabelle `event_messages`
--
ALTER TABLE `event_messages`
  ADD CONSTRAINT `message-event` FOREIGN KEY (`eventid`) REFERENCES `events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `message-user` FOREIGN KEY (`userid`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints der Tabelle `files`
--
ALTER TABLE `files`
  ADD CONSTRAINT `file-group` FOREIGN KEY (`groupid`) REFERENCES `groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `file-owner` FOREIGN KEY (`ownerid`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints der Tabelle `groups`
--
ALTER TABLE `groups`
  ADD CONSTRAINT `admin-user` FOREIGN KEY (`admin`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints der Tabelle `group_invite_keys`
--
ALTER TABLE `group_invite_keys`
  ADD CONSTRAINT `key-group` FOREIGN KEY (`groupid`) REFERENCES `groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints der Tabelle `group_members`
--
ALTER TABLE `group_members`
  ADD CONSTRAINT `gmember-user` FOREIGN KEY (`userid`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `groupmember-group` FOREIGN KEY (`groupid`) REFERENCES `groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints der Tabelle `group_messages`
--
ALTER TABLE `group_messages`
  ADD CONSTRAINT `groupmsg-author` FOREIGN KEY (`userid`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `message-group` FOREIGN KEY (`groupid`) REFERENCES `groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints der Tabelle `list_items`
--
ALTER TABLE `list_items`
  ADD CONSTRAINT `item-event` FOREIGN KEY (`eventid`) REFERENCES `events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints der Tabelle `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `user1-id` FOREIGN KEY (`userid1`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user2-id` FOREIGN KEY (`userid2`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints der Tabelle `votes`
--
ALTER TABLE `votes`
  ADD CONSTRAINT `vote_eventid` FOREIGN KEY (`eventid`) REFERENCES `events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints der Tabelle `vote_options`
--
ALTER TABLE `vote_options`
  ADD CONSTRAINT `option_vote` FOREIGN KEY (`voteid`) REFERENCES `votes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints der Tabelle `vote_user_vote`
--
ALTER TABLE `vote_user_vote`
  ADD CONSTRAINT `user-vote` FOREIGN KEY (`userid`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `uservote-option` FOREIGN KEY (`vote_option`) REFERENCES `vote_options` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `uservote-vote` FOREIGN KEY (`voteid`) REFERENCES `votes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
